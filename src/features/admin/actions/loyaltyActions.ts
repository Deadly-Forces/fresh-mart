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

export async function getAdminLoyaltyDataAction() {
  try {
    const { supabase } = await requireAdmin();

    const { data: transactions, error } = (await supabase
      .from("loyalty_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)) as { data: any[]; error: any };

    if (error) return { error: error.message };

    // Gather unique user ids
    const userIds = [...new Set((transactions || []).map((t: any) => t.user_id))];
    let usersMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);
      for (const p of profiles || []) usersMap[p.id] = p;
    }

    const enriched = (transactions || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      userName: usersMap[t.user_id]?.name || "Unknown",
      userEmail: usersMap[t.user_id]?.email || "N/A",
      points: t.points,
      type: t.type,
      description: t.description || "",
      createdAt: t.created_at,
    }));

    // Aggregate stats
    const totalEarned = (transactions || [])
      .filter((t: any) => t.points > 0)
      .reduce((s: number, t: any) => s + Number(t.points), 0);
    const totalRedeemed = (transactions || [])
      .filter((t: any) => t.points < 0)
      .reduce((s: number, t: any) => s + Math.abs(Number(t.points)), 0);

    return {
      transactions: enriched,
      stats: {
        totalTransactions: (transactions || []).length,
        totalEarned,
        totalRedeemed,
        uniqueUsers: userIds.length,
      },
    };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}
