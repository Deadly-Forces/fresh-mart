import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
    const supabase = await createClient();

    // 1. Fetch all orders for revenue analytics
    const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at, user_id")
        .order("created_at", { ascending: false });

    const orders = ordersData || [];
    const deliveredOrders = orders.filter((o: any) => o.status === "delivered");

    const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
    const totalOrdersCount = orders.length;
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / (deliveredOrders.length || 1) : 0;

    // 2. Fetch top selling products from order_items
    const { data: orderItemsData } = await supabase
        .from("order_items")
        .select("product_id, quantity, price, product_snapshot");

    const orderItems = orderItemsData || [];

    // Aggregate by product
    const productStats: Record<string, { name: string; sold: number; revenue: number }> = {};
    orderItems.forEach((item: any) => {
        const pid = item.product_id;
        const name = item.product_snapshot?.name || "Unknown Product";
        if (!productStats[pid]) {
            productStats[pid] = { name, sold: 0, revenue: 0 };
        }
        productStats[pid].sold += item.quantity;
        productStats[pid].revenue += Number(item.price || 0) * item.quantity;
    });

    const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // 3. Fetch top customers by spend (separate profile + order fetching to avoid FK join issues)
    const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, email")
        .order("created_at", { ascending: false });

    // Build per-user order stats from the already-fetched orders
    const userOrderStats: Record<string, { spent: number; count: number }> = {};
    orders.forEach((o: any) => {
        if (!o.user_id) return;
        if (!userOrderStats[o.user_id]) userOrderStats[o.user_id] = { spent: 0, count: 0 };
        userOrderStats[o.user_id].count += 1;
        if (o.status === "delivered") {
            userOrderStats[o.user_id].spent += Number(o.total || 0);
        }
    });

    const customerStats = (profilesData || [])
        .map((p: any) => {
            const stats = userOrderStats[p.id] || { spent: 0, count: 0 };
            return {
                name: p.name || p.email?.split("@")[0] || "Unknown",
                spent: stats.spent,
                orderCount: stats.count,
            };
        })
        .filter((c) => c.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

    // 4. Revenue by day (last 7 days)
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
    });

    const revenueByDay = last7Days.map((day) => {
        const dayOrders = deliveredOrders.filter((o: any) => o.created_at?.startsWith(day));
        const dayRevenue = dayOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
        return {
            day: new Date(day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            revenue: dayRevenue,
        };
    });

    const maxDayRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

    return (
        <div className="space-y-8">
            <div className="flex justify-end mb-2">
                <AutoRefresh intervalMs={30000} tables={["orders", "order_items", "profiles"]} />
            </div>

            {/* Revenue Section */}
            <section className="bg-card border border-border rounded-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-lg">Revenue Analytics</h3>
                    <Button variant="outline" size="sm" className="gap-1"><Download className="w-4 h-4" /> Export</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-secondary/50 rounded-button p-4 text-center">
                        <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="bg-secondary/50 rounded-button p-4 text-center">
                        <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                    </div>
                    <div className="bg-secondary/50 rounded-button p-4 text-center">
                        <p className="text-2xl font-bold">{totalOrdersCount}</p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                </div>
                {/* Simple bar chart using divs */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium mb-3">Revenue — Last 7 Days</p>
                    {revenueByDay.map((d) => (
                        <div key={d.day} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-28 shrink-0">{d.day}</span>
                            <div className="flex-1 bg-secondary/30 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-primary h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                    style={{ width: `${Math.max((d.revenue / maxDayRevenue) * 100, 2)}%` } as React.CSSProperties}
                                >
                                    {d.revenue > 0 && (
                                        <span className="text-[10px] font-bold text-primary-foreground">${d.revenue.toFixed(0)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Product Analytics */}
            <section className="bg-card border border-border rounded-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg">Top Selling Products</h3>
                    <Button variant="outline" size="sm" className="gap-1"><Download className="w-4 h-4" /> Export</Button>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-2 text-left font-medium text-muted-foreground text-xs">#</th>
                            <th className="py-2 text-left font-medium text-muted-foreground text-xs">Product</th>
                            <th className="py-2 text-left font-medium text-muted-foreground text-xs">Units Sold</th>
                            <th className="py-2 text-left font-medium text-muted-foreground text-xs">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {topProducts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-6 text-center text-muted-foreground text-sm">No sales data yet.</td>
                            </tr>
                        ) : topProducts.map((p, i) => (
                            <tr key={i} className="hover:bg-secondary/30">
                                <td className="py-3 text-muted-foreground">{i + 1}</td>
                                <td className="py-3 font-medium">{p.name}</td>
                                <td className="py-3">{p.sold}</td>
                                <td className="py-3 font-medium">${p.revenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Customer Analytics */}
            <section className="bg-card border border-border rounded-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg">Customer Analytics</h3>
                    <Button variant="outline" size="sm" className="gap-1"><Download className="w-4 h-4" /> Export</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Order status breakdown */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold mb-3">Order Status Breakdown</h4>
                        {["processing", "packed", "out_for_delivery", "delivered", "cancelled"].map((status) => {
                            const count = orders.filter((o: any) => o.status === status).length;
                            const pct = totalOrdersCount > 0 ? ((count / totalOrdersCount) * 100).toFixed(1) : "0";
                            return (
                                <div key={status} className="flex items-center justify-between py-1.5">
                                    <span className="text-sm capitalize text-muted-foreground">{status.replace(/_/g, " ")}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{count}</span>
                                        <span className="text-xs text-muted-foreground">({pct}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold mb-3">Top Customers by Spend</h4>
                        <div className="space-y-2">
                            {customerStats.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic py-2">No customer data yet.</p>
                            ) : customerStats.map((c, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div>
                                        <span className="text-sm font-medium">{c.name}</span>
                                        <span className="text-xs text-muted-foreground ml-2">({c.orderCount} orders)</span>
                                    </div>
                                    <span className="text-sm font-bold">${c.spent.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
