"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { rateLimit, isValidUUID, sanitizeString } from "@/lib/security";
import { z } from "zod";

const returnStatusSchema = z.enum([
  "pending",
  "manual_review",
  "approved",
  "rejected",
  "refunded",
]);

/** Verify that the current user is authenticated and has admin role */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  if (!rateLimit(`admin:${user.id}`, 100, 60_000)) {
    throw new Error("Too many requests. Please slow down.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }

  return { supabase, user };
}

export async function getAdminReturnRequestsAction() {
  try {
    const { supabase } = await requireAdmin();

    const { data: requests, error } = (await supabase
      .from("return_requests")
      .select("*")
      .order("created_at", { ascending: false })) as {
      data: any[];
      error: any;
    };

    if (error) {
      console.error("Error fetching return requests:", error);
      return { error: error.message };
    }

    // Fetch related order and user info
    const orderIds = [...new Set((requests || []).map((r: any) => r.order_id))];
    const userIds = [...new Set((requests || []).map((r: any) => r.user_id))];

    let ordersMap: Record<string, any> = {};
    if (orderIds.length > 0) {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, status")
        .in("id", orderIds);
      for (const o of orders || []) {
        ordersMap[o.id] = o;
      }
    }

    let usersMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email, phone")
        .in("id", userIds);
      for (const p of profiles || []) {
        usersMap[p.id] = p;
      }
    }

    const enrichedRequests = (requests || []).map((r: any) => ({
      ...r,
      order: ordersMap[r.order_id] || null,
      customer: usersMap[r.user_id] || null,
    }));

    return { requests: enrichedRequests };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function updateReturnRequestAction(
  requestId: string,
  status: string,
  adminNotes?: string,
  refundAmount?: number,
) {
  try {
    if (!isValidUUID(requestId)) {
      return { error: "Invalid request ID." };
    }

    const validation = returnStatusSchema.safeParse(status);
    if (!validation.success) {
      return { error: "Invalid status." };
    }

    const sanitizedNotes = adminNotes ? sanitizeString(adminNotes, 1000) : null;

    const { supabase } = await requireAdmin();

    const updateData: Record<string, any> = {
      status: validation.data,
      admin_notes: sanitizedNotes,
      updated_at: new Date().toISOString(),
    };

    if (refundAmount !== undefined && refundAmount > 0) {
      updateData.refund_amount = refundAmount;
    }

    const { error } = (await supabase
      .from("return_requests")
      .update(updateData)
      .eq("id", requestId)) as { error: any };

    if (error) {
      console.error("Error updating return request:", error);
      return { error: error.message };
    }

    // If status is refunded, award loyalty points as refund credit
    if (validation.data === "refunded" && refundAmount && refundAmount > 0) {
      // Get the return request to find the user
      const { data: request } = (await supabase
        .from("return_requests")
        .select("user_id, order_id")
        .eq("id", requestId)
        .single()) as { data: any; error: any };

      if (request) {
        const refundPoints = Math.floor(refundAmount);
        if (refundPoints > 0) {
          await supabase.from("loyalty_transactions").insert({
            user_id: request.user_id,
            points: refundPoints,
            type: "refund_credit",
            description: `Refund credit for return request`,
            order_id: request.order_id,
          } as any);

          await supabase
            .rpc("increment_loyalty_points" as any, {
              p_user_id: request.user_id,
              p_points: refundPoints,
            })
            .then(({ error: rpcError }) => {
              // If RPC doesn't exist, fall back to direct update
              if (rpcError) {
                return supabase
                  .from("profiles")
                  .update({
                    loyalty_points: refundPoints,
                  } as any)
                  .eq("id", request.user_id);
              }
            });
        }
      }
    }

    revalidatePath("/admin/returns");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}
