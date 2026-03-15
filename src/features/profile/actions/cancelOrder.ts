"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidUUID, rateLimit } from "@/lib/security";

const CANCELLABLE_STATUSES = ["pending", "processing", "confirmed"];

export async function cancelOrderAction(orderId: string) {
  try {
    // Rate limit
    if (!rateLimit("cancel-order", 10, 60_000)) {
      return { error: "Too many requests. Please try again later." };
    }

    // Validate input
    if (!orderId || !isValidUUID(orderId)) {
      return { error: "Invalid order ID." };
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to cancel an order." };
    }

    // Fetch the order with items to verify ownership and restore stock
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !order) {
      return { error: "Order not found." };
    }

    const currentStatus = order.status ?? "pending";

    if (!CANCELLABLE_STATUSES.includes(currentStatus)) {
      return {
        error: `Cannot cancel an order that is already ${currentStatus.replace("_", " ")}.`,
      };
    }

    // Fetch order items to restore stock
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Failed to fetch order items:", itemsError);
      return { error: "Failed to cancel order. Please try again." };
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to cancel order:", updateError);
      return { error: "Failed to cancel order. Please try again." };
    }

    // Restore stock for each item (best effort — don't fail the cancel if this errors)
    if (orderItems && orderItems.length > 0) {
      await supabase.rpc("restore_order_inventory" as any, {
        p_order_id: orderId,
      });
    }

    revalidatePath("/profile");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("cancelOrderAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}
