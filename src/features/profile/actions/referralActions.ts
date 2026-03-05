"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit, sanitizeString } from "@/lib/security";

export async function getReferralDataAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in." };
    }

    // Get user's referral code
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    // Get referrals made by this user
    const { data: referrals } = await supabase
      .from("referrals")
      .select(
        `
        id,
        status,
        reward_points,
        created_at,
        referred:referred_id (name, email)
      `
      )
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    const totalEarned =
      referrals
        ?.filter((r: Record<string, unknown>) => r.status === "rewarded")
        .reduce(
          (sum: number, r: Record<string, unknown>) =>
            sum + ((r.reward_points as number) || 0),
          0
        ) ?? 0;

    return {
      referralCode: profile?.referral_code ?? "",
      referrals: referrals ?? ([] as any[]),
      totalEarned,
    };
  } catch (error) {
    console.error("getReferralDataAction error:", error);
    return { error: "Failed to load referral data." };
  }
}

export async function applyReferralCodeAction(code: string) {
  try {
    const allowed = rateLimit("apply-referral", 5, 60_000);
    if (!allowed) {
      return { error: "Too many requests. Please try again later." };
    }

    const sanitizedCode = sanitizeString(code?.toUpperCase(), 20);
    if (!sanitizedCode || sanitizedCode.length < 4) {
      return { error: "Invalid referral code." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in." };
    }

    // Check if user already used a referral
    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_id", user.id)
      .maybeSingle();

    if (existingReferral) {
      return { error: "You have already used a referral code." };
    }

    // Find the referrer by code
    const { data: referrer } = await supabase
      .from("profiles")
      .select("id, referral_code")
      .eq("referral_code", sanitizedCode)
      .maybeSingle();

    if (!referrer) {
      return { error: "Referral code not found." };
    }

    if (referrer.id === user.id) {
      return { error: "You cannot use your own referral code." };
    }

    // Create referral record
    const { error: insertError } = await supabase.from("referrals").insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      status: "completed",
      reward_points: 100,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return { error: "You have already used a referral code." };
      }
      return { error: "Failed to apply referral code." };
    }

    // Award points to both users
    const bonusPoints = 100;

    // Award referrer
    await supabase.from("loyalty_transactions").insert({
      user_id: referrer.id,
      points: bonusPoints,
      type: "referral_bonus",
      description: "Referral bonus — a friend joined using your code",
    });
    await supabase.rpc("increment_loyalty_points", {
      user_row_id: referrer.id,
      amount: bonusPoints,
    }).then(({ error }) => {
      // Fallback if RPC doesn't exist
      if (error) {
        supabase
          .from("profiles")
          .select("loyalty_points")
          .eq("id", referrer.id)
          .single()
          .then(({ data }) => {
            if (data) {
              supabase
                .from("profiles")
                .update({ loyalty_points: (data.loyalty_points || 0) + bonusPoints })
                .eq("id", referrer.id);
            }
          });
      }
    });

    // Award referred user (current user)
    await supabase.from("loyalty_transactions").insert({
      user_id: user.id,
      points: bonusPoints,
      type: "referral_bonus",
      description: "Welcome bonus — joined via referral code",
    });
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({
        loyalty_points: ((currentProfile?.loyalty_points as number) || 0) + bonusPoints,
      })
      .eq("id", user.id);

    return { success: true, pointsEarned: bonusPoints };
  } catch (error) {
    console.error("applyReferralCodeAction error:", error);
    return { error: "Failed to apply referral code." };
  }
}
