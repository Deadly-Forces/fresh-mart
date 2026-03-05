"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReturnRequestAction(formData: FormData) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to submit a request." };
        }

        const orderId = formData.get("orderId") as string;
        const type = formData.get("type") as string;
        const reason = formData.get("reason") as string;
        const status = formData.get("status") as string;
        const adminNotes = formData.get("adminNotes") as string;
        const imageUrl = formData.get("imageUrl") as string | null;

        if (!orderId || !reason || !status) {
            return { error: "Missing required fields." };
        }

        // We use type as part of reason string so admin knows what they requested, e.g. "[Replace] Item broken"
        const formattedReason = `[${type.toUpperCase()}] ${reason.substring(0, 50)}${reason.length > 50 ? "..." : ""}`;

        const { error: insertError } = await supabase
            .from("return_requests")
            .insert({
                user_id: user.id,
                order_id: orderId,
                reason: formattedReason,
                description: reason,
                status: status, // "approved", "manual_review", etc.
                admin_notes: adminNotes,
                images: imageUrl ? [imageUrl] : null,
            });

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
