import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { ExportButton } from "../analytics/ExportButton";
import { Heart, Users, Package, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminWishlistPage() {
  const supabase = await createClient();

  // Fetch all wishlist entries with product name and user profile
  const { data: wishlistData } = await supabase
    .from("wishlist")
    .select(
      "id, product_id, user_id, created_at, products:product_id ( name, price, image_url )",
    )
    .order("created_at", { ascending: false });

  const entries = wishlistData || [];

  // KPI stats
  const totalEntries = entries.length;
  const uniqueProducts = new Set(entries.map((e: any) => e.product_id)).size;
  const uniqueUsers = new Set(entries.map((e: any) => e.user_id)).size;

  // Aggregate by product
  const productCounts: Record<
    string,
    { name: string; price: number; image_url: string | null; count: number }
  > = {};
  entries.forEach((e: any) => {
    const pid = e.product_id;
    const product = e.products as any;
    if (!productCounts[pid]) {
      productCounts[pid] = {
        name: product?.name || "Unknown",
        price: Number(product?.price || 0),
        image_url: product?.image_url || null,
        count: 0,
      };
    }
    productCounts[pid].count += 1;
  });

  const productList = Object.entries(productCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count);

  // Recent 20 wishlist additions with user info
  const recentUserIds = [
    ...new Set(entries.slice(0, 20).map((e: any) => e.user_id)),
  ];
  let profileMap: Record<string, string> = {};
  if (recentUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", recentUserIds);
    if (profiles) {
      profileMap = Object.fromEntries(
        profiles.map((p: any) => [
          p.id,
          p.name || p.email?.split("@")[0] || "Unknown",
        ]),
      );
    }
  }

  const recentActivity = entries.slice(0, 20).map((e: any) => ({
    userName: profileMap[e.user_id] || "Unknown",
    productName: (e.products as any)?.name || "Unknown",
    date: e.created_at,
  }));

  const kpis = [
    {
      label: "Total Wishlisted",
      value: totalEntries,
      icon: Heart,
      color: "text-red-500",
    },
    {
      label: "Unique Products",
      value: uniqueProducts,
      icon: Package,
      color: "text-blue-500",
    },
    {
      label: "Users with Wishlists",
      value: uniqueUsers,
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Avg per User",
      value: uniqueUsers > 0 ? (totalEntries / uniqueUsers).toFixed(1) : "0",
      icon: TrendingUp,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" /> Wishlist Analytics
        </h2>
        <AutoRefresh intervalMs={30000} tables={["wishlist"]} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Most Wishlisted Products Table */}
      <section className="bg-card border border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg">Most Wishlisted Products</h3>
          <ExportButton
            label="Export"
            fileName="wishlist-products.csv"
            headers={["#", "Product", "Price", "Wishlist Count"]}
            rows={productList.map((p, i) => [
              String(i + 1),
              p.name,
              `₹${p.price.toFixed(2)}`,
              String(p.count),
            ])}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                  #
                </th>
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                  Product
                </th>
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                  Price
                </th>
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                  Wishlist Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productList.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground text-sm"
                  >
                    No wishlist data yet.
                  </td>
                </tr>
              ) : (
                productList.map((p, i) => (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="py-3 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3">₹{p.price.toFixed(2)}</td>
                    <td className="py-3 font-bold">{p.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Wishlist Activity */}
      <section className="bg-card border border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg">Recent Activity</h3>
          <ExportButton
            label="Export"
            fileName="wishlist-recent-activity.csv"
            headers={["User", "Product", "Date"]}
            rows={recentActivity.map((a) => [
              a.userName,
              a.productName,
              new Date(a.date).toLocaleString(),
            ])}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                  User
                </th>
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                  Product
                </th>
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 text-center text-muted-foreground text-sm"
                  >
                    No recent activity.
                  </td>
                </tr>
              ) : (
                recentActivity.map((a, i) => (
                  <tr key={i} className="hover:bg-secondary/30">
                    <td className="py-3">{a.userName}</td>
                    <td className="py-3 font-medium">{a.productName}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(a.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
