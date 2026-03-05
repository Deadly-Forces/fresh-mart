"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Automatic discount tiers:
 * - Variable discount: 10% off the cart subtotal (₹100 off every ₹1000)
 *   e.g. ₹1000 → ₹100 off, ₹1500 → ₹150 off, ₹2000 → ₹200 off, etc.
 * - First-time user bonus: ₹200 extra off on first order only
 * - First-time users get BOTH discounts stacked
 */

export interface AutoDiscount {
    /** Unique key for this discount */
    key: string;
    /** Display label */
    label: string;
    /** Discount amount in ₹ */
    amount: number;
}

export interface AutoDiscountResult {
    discounts: AutoDiscount[];
    totalDiscount: number;
    isFirstOrder: boolean;
}

/**
 * Calculate automatic discounts based on cart subtotal and user order history.
 * Called from the client to show real-time discount info.
 */
export async function getAutoDiscountsAction(
    cartSubtotal: number,
): Promise<AutoDiscountResult> {
    const discounts: AutoDiscount[] = [];
    let isFirstOrder = false;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Check if user is logged in and if this is their first order
        if (user) {
            const { count } = await supabase
                .from("orders")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            isFirstOrder = (count ?? 0) === 0;
        }

        // 1. Variable discount: 10% off (₹100 per ₹1000)
        //    Only applies if cart is ₹1000 or more
        if (cartSubtotal >= 1000) {
            const variableDiscount = Math.floor(cartSubtotal / 1000) * 100;
            // Also handles ₹1500 → ₹150 (floor(1500/500)*50 = 150)
            // Actually the pattern is: ₹1000→₹100, ₹1500→₹150, ₹2000→₹200
            // That's exactly 10% of the cart value
            const tenPercent = Math.floor(cartSubtotal * 0.1);
            // Use the 10% calculation since it matches the user's pattern exactly
            discounts.push({
                key: "variable",
                label: `Save 10% on orders ₹1000+`,
                amount: tenPercent,
            });
        }

        // 2. First-time user bonus: ₹200 off
        if (isFirstOrder) {
            discounts.push({
                key: "first_order",
                label: "Welcome bonus — ₹200 off your first order!",
                amount: 200,
            });
        }

        const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);

        // Don't let discount exceed cart subtotal
        const cappedTotal = Math.min(totalDiscount, cartSubtotal);

        return {
            discounts: discounts.map((d) => ({
                ...d,
                // Proportionally cap each discount if total exceeds subtotal
                amount:
                    totalDiscount > cartSubtotal
                        ? Math.floor((d.amount / totalDiscount) * cappedTotal)
                        : d.amount,
            })),
            totalDiscount: cappedTotal,
            isFirstOrder,
        };
    } catch {
        // If anything fails, return no discounts (don't break checkout)
        return { discounts: [], totalDiscount: 0, isFirstOrder: false };
    }
}
