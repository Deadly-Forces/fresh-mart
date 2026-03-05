"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit, sanitizeString } from "@/lib/security";

export async function validatePromoCodeAction(code: string, cartTotal: number) {
  if (!code) {
    return { error: "Please enter a promo code." };
  }

  // Sanitize and validate the code
  const sanitizedCode = sanitizeString(code, 50);
  if (!sanitizedCode || sanitizedCode.length < 2) {
    return { error: "Invalid promo code format." };
  }

  // Validate cart total
  if (typeof cartTotal !== "number" || cartTotal < 0 || cartTotal > 1000000) {
    return { error: "Invalid cart total." };
  }

  try {
    const supabase = await createClient();

    // Get user for rate limiting
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const rateLimitKey = user ? `promo:${user.id}` : `promo:anon`;
    const rateLimitMax = user ? 10 : 3;

    // Rate limit: prevent brute-force code guessing
    if (!rateLimit(rateLimitKey, rateLimitMax, 60_000)) {
      return {
        error: "Too many attempts. Please wait a minute and try again.",
      };
    }

    // 1. Find the coupon in the unified coupons table
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", sanitizedCode.trim().toUpperCase())
      .single();

    if (error || !coupon) {
      return { error: "Invalid promo code." };
    }

    // 2. Check if active
    if (!coupon.is_active) {
      return { error: "This promo code is no longer active." };
    }

    // 3. Check expiry date
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { error: "This promo code has expired." };
    }

    // 4. Check global usage limits
    if (coupon.max_uses && (coupon.used_count ?? 0) >= coupon.max_uses) {
      return { error: "This promo code has reached its usage limit." };
    }

    // 5. Check per-user usage limit
    if (user && coupon.per_user_limit) {
      const { count } = await supabase
        .from("coupon_usage")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id);

      if ((count ?? 0) >= coupon.per_user_limit) {
        return { error: "You've already used this promo code." };
      }
    }

    // 5b. WELCOME coupons are for first-time users only (zero delivered orders)
    if (coupon.code.startsWith("WELCOME") && user) {
      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "delivered");

      if ((orderCount ?? 0) > 0) {
        return { error: "This coupon is only valid for your first order." };
      }
    }

    // 6. Check min order value
    if (coupon.min_order && cartTotal < Number(coupon.min_order)) {
      return {
        error: `Minimum order value of ₹${Number(coupon.min_order)} required for this code.`,
      };
    }

    // 7. Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = cartTotal * (Number(coupon.value) / 100);
      if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
        discountAmount = Number(coupon.max_discount);
      }
    } else if (coupon.type === "flat") {
      discountAmount = Number(coupon.value);
    }

    // Don't discount more than the subtotal
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return {
      success: true,
      promo: {
        id: coupon.id,
        code: coupon.code,
        discountAmount: Number(discountAmount.toFixed(2)),
      },
    };
  } catch (e: any) {
    console.error("Promo validation error:", e);
    return { error: "Failed to validate promo code." };
  }
}
