"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { rateLimit, isValidUUID, sanitizeString } from "@/lib/security";

const VALID_REASONS = [
  "damaged",
  "wrong_item",
  "quality",
  "missing_item",
  "other",
] as const;

export async function getReturnRequestsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in." };
    }

    const { data: requests } = await supabase
      .from("return_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return { requests: requests ?? [] };
  } catch (error) {
    console.error("getReturnRequestsAction error:", error);
    return { error: "Failed to load return requests." };
  }
}

export async function createReturnRequestAction(formData: FormData) {
  try {
    const allowed = rateLimit("create-return", 5, 60_000);
    if (!allowed) {
      return { error: "Too many requests. Please try again later." };
    }

    const orderId = formData.get("orderId") as string;
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string;

    // Validate inputs
    if (!orderId || !isValidUUID(orderId)) {
      return { error: "Invalid order ID." };
    }

    if (!reason || !VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
      return { error: "Please select a valid reason." };
    }

    const sanitizedDescription = sanitizeString(description, 1000);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in." };
    }

    // Verify order belongs to user and is delivered
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, total")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return { error: "Order not found." };
    }

    if (order.status !== "delivered") {
      return { error: "Only delivered orders can be returned." };
    }

    // Check if a return request already exists for this order
    const { data: existing } = await supabase
      .from("return_requests")
      .select("id")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return { error: "A return request already exists for this order." };
    }

    // Create return request
    const { error: insertError } = await supabase
      .from("return_requests")
      .insert({
        order_id: orderId,
        user_id: user.id,
        reason,
        description: sanitizedDescription,
        refund_amount: order.total,
      });

    if (insertError) {
      console.error("Insert return request error:", insertError);
      return { error: "Failed to submit return request." };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("createReturnRequestAction error:", error);
    return { error: "Failed to submit return request." };
  }
}
