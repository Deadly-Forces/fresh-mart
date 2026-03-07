"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Automatic discount tiers:
 * - Variable discount: 10% off the cart subtotal on orders ₹500+
 *   e.g. ₹500 → ₹50 off, ₹1000 → ₹100 off, ₹1500 → ₹150 off, ₹2000 → ₹200 off
 * - First-time user bonus: extra 20% off on first order (total 30%)
 * - After first order, regular 10% applies
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
        .eq("user_id", user.id)
        .neq("status", "cancelled");

      isFirstOrder = (count ?? 0) === 0;
    }

    // Check how many orders the user has placed today (limit: 2 per day)
    let todayOrderCount = 0;
    if (user) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: todayCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());

      todayOrderCount = todayCount ?? 0;
    }

    // 1. First-time user bonus: 20% off (always, regardless of cart amount)
    if (isFirstOrder) {
      const extraDiscount = Math.floor(cartSubtotal * 0.2);
      discounts.push({
        key: "first_order",
        label: "First order bonus — 20% off!",
        amount: extraDiscount,
      });
    }

    // 2. Regular 10% discount on orders ₹500+ (max 2 per day)
    //    First-time users also get this ON TOP if they meet ₹500 threshold
    if (cartSubtotal >= 500 && todayOrderCount < 2) {
      const regularDiscount = Math.floor(cartSubtotal * 0.1);
      discounts.push({
        key: "variable",
        label: isFirstOrder
          ? `Plus 10% regular discount on ₹500+`
          : `Save 10% on orders ₹500+ (${2 - todayOrderCount} left today)`,
        amount: regularDiscount,
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
