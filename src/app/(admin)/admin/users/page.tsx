import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

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
    // Use ISO date string to avoid hydration mismatch
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or name..."
            className="pl-9 h-10"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  User
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Phone
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Orders
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Total Spent
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Joined
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.phone}
                    </td>
                    <td className="px-4 py-3">{u.orders}</td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{u.spent.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.joined}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-pill font-medium capitalize ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
          Showing {users.length} user{users.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
