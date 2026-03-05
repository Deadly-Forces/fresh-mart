"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Authentication required.");
  if (!rateLimit(`admin:${user.id}`, 100, 60_000))
    throw new Error("Too many requests. Please slow down.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden: Admin access required.");

  return { supabase, user };
}

export async function getAdminReferralsDataAction() {
  try {
    const { supabase } = await requireAdmin();

    const { data: referrals, error } = (await supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)) as { data: any[]; error: any };

    if (error) return { error: error.message };

    // Gather user ids (referrers + referred)
    const userIds = [
      ...new Set([
        ...(referrals || []).map((r: any) => r.referrer_id),
        ...(referrals || []).map((r: any) => r.referred_id).filter(Boolean),
      ]),
    ];

    let usersMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);
      for (const p of profiles || []) usersMap[p.id] = p;
    }

    const enriched = (referrals || []).map((r: any) => ({
      id: r.id,
      referrerId: r.referrer_id,
      referrerName: usersMap[r.referrer_id]?.name || "Unknown",
      referrerEmail: usersMap[r.referrer_id]?.email || "N/A",
      referredId: r.referred_id,
      referredName: r.referred_id ? usersMap[r.referred_id]?.name || "Unknown" : null,
      referredEmail: r.referred_id ? usersMap[r.referred_id]?.email || "N/A" : null,
      referralCode: r.referral_code,
      status: r.status,
      rewardPoints: r.reward_points || 0,
      createdAt: r.created_at,
    }));

    const stats = {
      total: (referrals || []).length,
      pending: (referrals || []).filter((r: any) => r.status === "pending").length,
      completed: (referrals || []).filter((r: any) => r.status === "completed").length,
      totalRewardPoints: (referrals || [])
        .filter((r: any) => r.status === "completed")
        .reduce((s: number, r: any) => s + Number(r.reward_points || 0), 0),
    };

    return { referrals: enriched, stats };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}
