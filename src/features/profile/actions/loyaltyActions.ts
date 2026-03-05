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

    if (!profile || profile.loyalty_points < points) {
      return { error: "Insufficient points balance." };
    }

    // Deduct points
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ loyalty_points: profile.loyalty_points - points })
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

    return {
      success: true,
      newBalance: profile.loyalty_points - points,
      discount: points / 10,
    };
  } catch (error) {
    console.error("redeemPointsAction error:", error);
    return { error: "Failed to redeem points." };
  }
}
