"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import {
  rateLimit,
  isValidUUID,
  MAX_ORDER_TOTAL,
  MAX_ORDER_ITEMS,
  MAX_ITEM_QUANTITY,
} from "@/lib/security";
import type { Database } from "@/lib/supabase/types";

type PaymentMethod =
  Database["public"]["Tables"]["orders"]["Row"]["payment_method"];

interface OrderItemPayload {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export async function placeOrderAction(
  addressId: string,
  deliverySlot: string,
  paymentMethod: string,
  total: number,
  items: OrderItemPayload[],
  substitutionPreference: string = "best_match",
  appliedPromocode?: string,
  discountAmount: number = 0,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to place an order." };
    }

    // Rate limit: max 5 orders per minute per user
    if (!rateLimit(`order:${user.id}`, 5, 60_000)) {
      return {
        error: "Too many order attempts. Please wait a moment and try again.",
      };
    }

    // Validate inputs
    if (!isValidUUID(addressId)) {
      return { error: "Invalid address." };
    }

    if (items.length === 0) {
      return { error: "Cannot place an empty order." };
    }

    if (items.length > MAX_ORDER_ITEMS) {
      return {
        error: `Cannot place an order with more than ${MAX_ORDER_ITEMS} items.`,
      };
    }

    for (const item of items) {
      if (!isValidUUID(item.productId)) {
        return { error: "Invalid product in cart." };
      }
      if (item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) {
        return { error: `Invalid quantity for "${item.name}".` };
      }
    }

    if (total < 0 || total > MAX_ORDER_TOTAL) {
      return { error: "Invalid order total." };
    }

    // Server-side price validation: verify prices against database
    const productIds = items.map((item) => item.productId);
    const { data: dbProducts, error: priceCheckError } = await supabase
      .from("products")
      .select("id, price, name, is_active, stock")
      .in("id", productIds);

    if (priceCheckError || !dbProducts) {
      console.error("Error verifying product prices:", priceCheckError);
      return { error: "Failed to verify product prices. Please try again." };
    }

    const priceMap = new Map(
      dbProducts.map((p) => [p.id, { ...p, price: Number(p.price) }]),
    );
    for (const item of items) {
      const dbProduct = priceMap.get(item.productId);
      if (!dbProduct) {
        return { error: `Product "${item.name}" is no longer available.` };
      }
      if (!dbProduct.is_active) {
        return {
          error: `Product "${dbProduct.name}" is currently unavailable.`,
        };
      }
      // Allow small floating-point tolerance (1 cent)
      if (Math.abs(item.price - dbProduct.price) > 0.01) {
        console.error(
          `Price mismatch for ${item.name}: cart=${item.price}, db=${dbProduct.price}`,
        );
        return {
          error: `Price for "${dbProduct.name}" has changed. Please refresh your cart.`,
        };
      }
      // Check stock availability
      if ((dbProduct.stock ?? 0) < item.quantity) {
        const available = dbProduct.stock ?? 0;
        if (available === 0) {
          return { error: `"${dbProduct.name}" is out of stock.` };
        }
        return {
          error: `Only ${available} units of "${dbProduct.name}" available. Please reduce quantity.`,
        };
      }
    }

    // Recalculate subtotal server-side (item prices already validated above)
    const calculatedSubtotal = items.reduce((sum, item) => {
      const dbProduct = priceMap.get(item.productId)!;
      return sum + dbProduct.price * item.quantity;
    }, 0);

    // Client total includes delivery/express fees - we validate individual prices above
    // Allow tolerance for: discount + delivery fee (₹49) + express fee (₹49) + rounding
    const maxFees = 49 + 49 + 10; // ~₹108 tolerance for fees
    const minExpectedTotal = Math.max(0, calculatedSubtotal - discountAmount);
    const maxExpectedTotal = calculatedSubtotal + maxFees;

    if (total < minExpectedTotal - 1 || total > maxExpectedTotal + 1) {
      console.error(
        `Total validation failed: client=${total}, subtotal=${calculatedSubtotal}, discount=${discountAmount}`,
      );
      return {
        error: "Order total mismatch. Please refresh your cart and try again.",
      };
    }

    // Use the client's total (which includes delivery fees) - prices already validated
    const verifiedTotal = total;

    // Prepare order items data for RPC
    const orderItemsPayload = items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      price: priceMap.get(item.productId)!.price,
      product_snapshot: {
        name: item.name,
        image: item.image,
      },
    }));

    // Create order and items atomically using RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)(
      "create_order_with_items",
      {
        p_address_id: addressId,
        p_delivery_slot: deliverySlot,
        p_payment_method: paymentMethod,
        p_total: verifiedTotal,
        p_substitution_preference: substitutionPreference,
        p_applied_promocode: appliedPromocode || null,
        p_discount_amount: discountAmount,
        p_items: orderItemsPayload,
      },
    );

    if (rpcError) {
      console.error("Error in create_order_with_items RPC:", rpcError);
      return { error: rpcError.message || "Failed to create order." };
    }

    // Check RPC result for application-level errors
    const result = rpcResult as unknown as {
      success?: boolean;
      order_id?: string;
      error?: string;
    };
    if (result.error) {
      console.error("Order creation failed:", result.error);
      if (
        result.error.includes("policy") ||
        result.error.includes("permission")
      ) {
        return {
          error: "Permission denied. Please try again or contact support.",
        };
      }
      if (result.error.includes("violates foreign key")) {
        return {
          error:
            "One or more products are no longer available. Please refresh your cart.",
        };
      }
      return { error: result.error };
    }

    if (!result.success || !result.order_id) {
      return { error: "Failed to create order. Please try again." };
    }

    const orderId = result.order_id;

    // 3. Trigger Post-Order Integrations (Fire and forget)
    // Ensure we send it to the logged in user's email
    const customerEmail = user.email || "customer@example.com";
    sendOrderConfirmationEmail(orderId, customerEmail).catch((e) => {
      console.error("Non-fatal: Failed to send order confirmation email", e);
    });

    return { success: true, orderId };
  } catch (err: any) {
    console.error("Error in placeOrderAction:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}
