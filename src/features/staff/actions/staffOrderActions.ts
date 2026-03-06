"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────
//  Shared helper — verify role and get current user
// ─────────────────────────────────────────────────────────────
async function getAuthedStaff(requiredRole: "picker" | "delivery") {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: "Unauthorized", supabase: null, user: null };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== requiredRole) {
        return { error: "Forbidden", supabase: null, user: null };
    }

    return { error: null, supabase, user, profile };
}

// ─────────────────────────────────────────────────────────────
//  PICKER ACTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch orders waiting to be picked (status: processing | confirmed)
 * and orders currently being packed (status: packed).
 * Includes all order_items with product snapshots.
 */
export async function getPickerOrdersAction() {
    const { error, supabase } = await getAuthedStaff("picker");
    if (error || !supabase) return { error, orders: [] };

    const { data, error: fetchError } = await supabase
        .from("orders")
        .select(
            `
            id,
            status,
            total,
            created_at,
            notes,
            delivery_slot,
            profiles:user_id ( name, phone ),
            addresses:address_id ( building, street, area, city ),
            order_items (
                id,
                product_id,
                quantity,
                price,
                product_snapshot
            )
        `,
        )
        .in("status", ["processing", "confirmed", "packed"])
        .order("created_at", { ascending: true });

    if (fetchError) return { error: fetchError.message, orders: [] };

    return { error: null, orders: data || [] };
}

/**
 * Mark an order as packed — called when picker completes all items.
 * Validates only pickers can call this.
 */
export async function markOrderPackedAction(orderId: string) {
    const { error, supabase } = await getAuthedStaff("picker");
    if (error || !supabase) return { error };

    const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "packed", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .in("status", ["processing", "confirmed"]); // guard: only valid transitions

    if (updateError) return { error: updateError.message };

    revalidatePath("/picker");
    revalidatePath("/admin/orders");
    return { error: null };
}

// ─────────────────────────────────────────────────────────────
//  RIDER ACTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch orders ready for delivery (packed) and active deliveries.
 * Includes address and customer info.
 */
export async function getRiderOrdersAction() {
    const { error, supabase } = await getAuthedStaff("delivery");
    if (error || !supabase) return { error, orders: [] };

    const { data, error: fetchError } = await supabase
        .from("orders")
        .select(
            `
            id,
            status,
            total,
            created_at,
            payment_method,
            payment_status,
            delivery_slot,
            profiles:user_id ( name, phone, email ),
            addresses:address_id ( building, street, area, landmark, city, pincode ),
            order_items (
                id,
                quantity,
                product_snapshot
            )
        `,
        )
        .in("status", ["packed", "out_for_delivery", "delivered"])
        .order("created_at", { ascending: true });

    if (fetchError) return { error: fetchError.message, orders: [] };

    // Return only today's and recent orders (last 24h)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = (data || []).filter((o) => o.created_at >= cutoff);

    return { error: null, orders: recent };
}

/**
 * Rider accepts an order — status: packed → out_for_delivery.
 */
export async function acceptDeliveryAction(orderId: string) {
    const { error, supabase } = await getAuthedStaff("delivery");
    if (error || !supabase) return { error };

    const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "out_for_delivery", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .eq("status", "packed"); // must be packed to accept

    if (updateError) return { error: updateError.message };

    revalidatePath("/rider");
    revalidatePath("/admin/orders");
    return { error: null };
}

/**
 * Rider marks an order as delivered — status: out_for_delivery → delivered.
 */
export async function markDeliveredAction(orderId: string) {
    const { error, supabase } = await getAuthedStaff("delivery");
    if (error || !supabase) return { error };

    const { error: updateError } = await supabase
        .from("orders")
        .update({
            status: "delivered",
            updated_at: new Date().toISOString(),
            payment_status: "paid", // COD is paid on delivery
        })
        .eq("id", orderId)
        .eq("status", "out_for_delivery");

    if (updateError) return { error: updateError.message };

    revalidatePath("/rider");
    revalidatePath("/admin/orders");
    return { error: null };
}
