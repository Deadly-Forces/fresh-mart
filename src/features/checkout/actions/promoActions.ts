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

    // Get user for rate limiting (allow unauthenticated but with stricter limits)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const rateLimitKey = user ? `promo:${user.id}` : `promo:anon`;
    const rateLimitMax = user ? 10 : 3; // Authenticated users get more attempts

    // Rate limit: prevent brute-force code guessing
    if (!rateLimit(rateLimitKey, rateLimitMax, 60_000)) {
      return {
        error: "Too many attempts. Please wait a minute and try again.",
      };
    }

    // 1. Find the promo code
    const { data: promo, error } = await supabase
      .from("promocodes")
      .select("*")
      .eq("code", sanitizedCode.trim().toUpperCase())
      .single();

    if (error || !promo) {
      return { error: "Invalid promo code." };
    }

    // 2. Check if active
    if (!promo.is_active) {
      return { error: "This promo code is no longer active." };
    }

    // 3. Check dates
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return { error: "This promo code is not valid yet." };
    }
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return { error: "This promo code has expired." };
    }

    // 4. Check usage limits
    if (promo.usage_limit && promo.times_used >= promo.usage_limit) {
      return { error: "This promo code has reached its usage limit." };
    }

    // 5. Check min order value
    if (promo.min_order_value && cartTotal < promo.min_order_value) {
      return {
        error: `Minimum order value of $${promo.min_order_value} required for this code.`,
      };
    }

    // 6. Calculate discount
    let discountAmount = 0;
    if (promo.discount_type === "percentage") {
      discountAmount = cartTotal * (promo.discount_value / 100);
      if (promo.max_discount && discountAmount > promo.max_discount) {
        discountAmount = promo.max_discount;
      }
    } else if (promo.discount_type === "fixed") {
      discountAmount = promo.discount_value;
    }

    // Just to be safe, don't discount more than the subtotal
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return {
      success: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discountAmount: Number(discountAmount.toFixed(2)),
      },
    };
  } catch (e: any) {
    console.error("Promo validation error:", e);
    return { error: "Failed to validate promo code." };
  }
}
