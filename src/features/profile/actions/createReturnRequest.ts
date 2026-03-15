"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isValidUUID, rateLimit, sanitizeString } from "@/lib/security";

const VALID_TYPES = new Set(["return", "replace"]);
const VALID_STATUSES = new Set(["pending", "manual_review", "approved"]);

export async function createReturnRequestAction(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to submit a request." };
    }

    if (!rateLimit(`return-request:${user.id}`, 5, 60_000)) {
      return { error: "Too many requests. Please wait a moment and try again." };
    }

    const orderId = formData.get("orderId") as string;
    const type = formData.get("type") as string;
    const reason = formData.get("reason") as string;
    const status = formData.get("status") as string;
    const adminNotes = formData.get("adminNotes") as string;
    const itemsJson = formData.get("items") as string | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (!orderId || !reason || !status) {
      return { error: "Missing required fields." };
    }

    if (!isValidUUID(orderId)) {
      return { error: "Invalid order." };
    }

    if (!VALID_TYPES.has(type)) {
      return { error: "Invalid request type." };
    }

    const sanitizedReason = sanitizeString(reason, 1000);
    const sanitizedAdminNotes = sanitizeString(adminNotes, 1000);
    const normalizedStatus = VALID_STATUSES.has(status)
      ? status
      : "manual_review";

    if (!sanitizedReason || sanitizedReason.length < 10) {
      return {
        error: "Please provide a more detailed reason for the return/replacement.",
      };
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      console.error("Return request order lookup error:", orderError);
      return { error: "Order not found." };
    }

    if (order.status !== "delivered") {
      return { error: "Only delivered orders can be returned or replaced." };
    }

    const { data: existingRequest, error: existingRequestError } =
      await supabase
        .from("return_requests")
        .select("id")
        .eq("order_id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingRequestError) {
      console.error(
        "Return request duplicate check error:",
        existingRequestError,
      );
      return { error: "Failed to validate the request. Please try again." };
    }

    if (existingRequest) {
      return { error: "A return or replacement request already exists for this order." };
    }

    // Prefix the short reason so staff can scan the request type quickly.
    const formattedReason = `[${type.toUpperCase()}] ${sanitizedReason.slice(0, 50)}${sanitizedReason.length > 50 ? "..." : ""}`;

    let parsedItems = null;
    if (itemsJson) {
      try {
        parsedItems = JSON.parse(itemsJson);
      } catch (e) {
        console.error("Failed to parse items json:", e);
      }
    }

    const fullPayload = {
      user_id: user.id,
      order_id: orderId,
      reason: formattedReason,
      description: sanitizedReason,
      status: normalizedStatus,
      admin_notes: sanitizedAdminNotes,
      items: parsedItems,
      images: imageUrl ? [imageUrl] : null,
      refund_amount: type === "return" ? Number(order.total) : null,
    };

    let { error: insertError } = await supabaseAdmin
      .from("return_requests")
      .insert(fullPayload);

    if (
      insertError &&
      /column|schema cache|does not exist|Could not find the/i.test(
        [insertError.message, insertError.details, insertError.hint]
          .filter(Boolean)
          .join(" "),
      )
    ) {
      const legacyPayload = {
        user_id: user.id,
        order_id: orderId,
        reason: formattedReason,
        description: sanitizedReason,
        status: normalizedStatus,
        refund_amount: type === "return" ? Number(order.total) : null,
      };

      const fallbackResult = await supabaseAdmin
        .from("return_requests")
        .insert(legacyPayload);

      insertError = fallbackResult.error;
    }

    if (insertError) {
      console.error("Error creating return request:", insertError);
      return { error: "Failed to submit request. Please try again." };
    }

    // Invalidate caches
    revalidatePath("/profile");
    revalidatePath("/admin/returns");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (e: any) {
    console.error("Exception creating return request:", e);
    return { error: e.message || "An unexpected error occurred." };
  }
}
