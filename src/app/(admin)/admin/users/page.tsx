import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch profiles
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const allProfiles = profilesData || [];

  // Fetch orders separately to avoid FK join issues between orders and profiles
  const profileIds = allProfiles.map((p: any) => p.id);
  let ordersByUser: Record<string, { count: number; total: number }> = {};
  if (profileIds.length > 0) {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("user_id, total")
      .in("user_id", profileIds);

    for (const o of ordersData || []) {
      const uid = o.user_id;
      if (!uid) continue;
      if (!ordersByUser[uid]) ordersByUser[uid] = { count: 0, total: 0 };
      ordersByUser[uid].count += 1;
      ordersByUser[uid].total += Number(o.total || 0);
    }
  }

  const users = allProfiles.map((p: any) => {
    const stats = ordersByUser[p.id] || { count: 0, total: 0 };
    const joinedDate = p.created_at
      ? new Date(p.created_at).toISOString().split("T")[0]
      : "N/A";
    return {
      id: p.id,
      name: p.name || p.email?.split("@")[0] || "Unknown User",
      email: p.email || "N/A",
      phone: p.phone || "N/A",
      orders: stats.count,
      spent: stats.total,
      joined: joinedDate,
      role: p.role || "customer",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh intervalMs={30000} tables={["profiles", "orders"]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">
            {users.filter((u) => u.orders > 0).length}
          </p>
          <p className="text-xs text-muted-foreground">Active Customers</p>
        </div>
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">
            ₹{users.reduce((s, u) => s + u.spent, 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
      </div>

      <UsersClient users={users} />
    </div>
  );
}

