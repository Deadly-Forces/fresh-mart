"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Database } from "@/lib/supabase/types";

type PaymentMethod = Database["public"]["Tables"]["orders"]["Row"]["payment_method"];

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
    substitutionPreference: string = 'best_match',
    appliedPromocode?: string,
    discountAmount: number = 0
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to place an order." };
        }

        if (items.length === 0) {
            return { error: "Cannot place an empty order." };
        }

        // 1. Insert Order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: user.id,
                address_id: addressId,
                status: "processing",
                total: total,
                payment_method: paymentMethod as PaymentMethod,
                payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
                delivery_slot: deliverySlot,
                substitution_preference: substitutionPreference,
                applied_promocode: appliedPromocode || null,
                discount_amount: discountAmount,
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error("Error creating order:", orderError);
            return { error: orderError?.message || "Failed to create order." };
        }

        // 2. Insert Order Items
        const orderItemsData = items.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            product_snapshot: {
                name: item.name,
                image: item.image,
            }
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItemsData);

        if (itemsError) {
            console.error("Error inserting order items:", itemsError);
            // Ideally an RPC/transaction is better, but doing it sequentially for now
            return { error: "Order created but failed to save items. Please contact support." };
        }

        // 3. Trigger Post-Order Integrations (Fire and forget)
        // Ensure we send it to the logged in user's email 
        const customerEmail = user.email || 'customer@example.com';
        sendOrderConfirmationEmail(order.id, customerEmail, total).catch((e) => {
            console.error("Non-fatal: Failed to send order confirmation email", e);
        });

        return { success: true, orderId: order.id };
    } catch (err: any) {
        console.error("Error in placeOrderAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}
