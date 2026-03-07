"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security";

export async function getLoyaltyDataAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in." };
    }

    // Get current points balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", user.id)
      .single();

    // Get transaction history
    const { data: transactions } = await supabase
      .from("loyalty_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return {
      points: profile?.loyalty_points ?? 0,
      transactions: transactions ?? ([] as any[]),
    };
  } catch (error) {
    console.error("getLoyaltyDataAction error:", error);
    return { error: "Failed to load loyalty data." };
  }
}

export async function redeemPointsAction(points: number) {
  try {
    const allowed = rateLimit("redeem-points", 5, 60_000);
    if (!allowed) {
      return { error: "Too many requests. Please try again later." };
    }

    if (!points || points < 100 || !Number.isInteger(points)) {
      return { error: "Minimum 100 points required to redeem." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in." };
    }

    // Check current balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", user.id)
      .single();

    const currentPoints = profile?.loyalty_points ?? 0;

    if (!profile || currentPoints < points) {
      return { error: "Insufficient points balance." };
    }

    // Deduct points
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ loyalty_points: currentPoints - points })
      .eq("id", user.id);

    if (updateError) {
      return { error: "Failed to redeem points." };
    }

    // Log transaction
    await supabase.from("loyalty_transactions").insert({
      user_id: user.id,
      points: -points,
      type: "redeemed",
      description: `Redeemed ${points} points for ₹${(points / 10).toFixed(2)} discount`,
    });

    const code = `LP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const discountAmount = points / 10;

    // Create a real coupon for the user to use at checkout
    await supabase.from("coupons").insert({
      code,
      type: "flat",
      value: discountAmount,
      min_order: 0,
      max_uses: 1,
      is_active: true,
      per_user_limit: 1,
      description: `Loyalty discount for ${points} points`,
    });

    return {
      success: true,
      newBalance: currentPoints - points,
      discount: discountAmount,
      code,
    };
  } catch (error) {
    console.error("redeemPointsAction error:", error);
    return { error: "Failed to redeem points." };
  }
}
