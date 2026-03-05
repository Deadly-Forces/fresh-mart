"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidUUID, rateLimit } from "@/lib/security";

export async function deleteOrderAction(orderId: string) {
  try {
    // Rate limit
    const allowed = rateLimit("delete-order", 10, 60_000);
    if (!allowed) {
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
      return { error: "You must be logged in to delete an order." };
    }

    // Verify the order belongs to the user before deleting
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !order) {
      return { error: "Order not found." };
    }

    // Order status check removed: allow deleting any order from history

    // Delete the order (order_items cascade automatically)
    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to delete order:", deleteError);
      return { error: "Failed to delete order. Please try again." };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("deleteOrderAction error:", error);
    return { error: "An unexpected error occurred." };
  }
}
