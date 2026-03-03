import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch Orders for KPIs (paginated to handle >1000)
  const ORDER_PAGE_SIZE = 1000;
  let allOrders: any[] = [];
  let orderFrom = 0;
  let hasMoreOrders = true;

  while (hasMoreOrders) {
    const { data: batch } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .range(orderFrom, orderFrom + ORDER_PAGE_SIZE - 1);

    if (batch && batch.length > 0) {
      allOrders = allOrders.concat(batch);
      orderFrom += ORDER_PAGE_SIZE;
      hasMoreOrders = batch.length === ORDER_PAGE_SIZE;
    } else {
      hasMoreOrders = false;
    }
  }

  const orders = allOrders;

  // Revenue is only from successfully delivered orders in this simple model
  const totalRevenue = orders
    .filter((o: any) => o.status === "delivered")
    .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

  const totalOrdersCount = orders.length;

  // We treat 'processing' as our pending state for action needed
  const pendingOrdersCount = orders.filter(
    (o: any) => o.status === "processing",
  ).length;

  // 2. Fetch Customers Count
  const { count: customersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Compute period-over-period changes (last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const fourteenDaysAgo = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const thisWeekOrders = orders.filter(
    (o: any) => o.created_at >= sevenDaysAgo,
  );
  const lastWeekOrders = orders.filter(
    (o: any) => o.created_at >= fourteenDaysAgo && o.created_at < sevenDaysAgo,
  );

  const thisWeekRevenue = thisWeekOrders
    .filter((o: any) => o.status === "delivered")
    .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
  const lastWeekRevenue = lastWeekOrders
    .filter((o: any) => o.status === "delivered")
    .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

  const revenueChange =
    lastWeekRevenue > 0
      ? (((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(
          1,
        )
      : thisWeekRevenue > 0
        ? "+100"
        : "0";
  const ordersChange =
    lastWeekOrders.length > 0
      ? (
          ((thisWeekOrders.length - lastWeekOrders.length) /
            lastWeekOrders.length) *
          100
        ).toFixed(1)
      : thisWeekOrders.length > 0
        ? "+100"
        : "0";

  const kpis = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      change: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`,
      up: Number(revenueChange) >= 0,
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: totalOrdersCount.toString(),
      change: `${Number(ordersChange) >= 0 ? "+" : ""}${ordersChange}%`,
      up: Number(ordersChange) >= 0,
      icon: ShoppingCart,
    },
    {
      label: "Total Customers",
      value: (customersCount || 0).toString(),
      change: `${customersCount || 0} registered`,
      up: true,
      icon: Users,
    },
    {
      label: "Pending Orders",
      value: pendingOrdersCount.toString(),
      change: pendingOrdersCount > 0 ? "Needs Action" : "All Clear",
      up: pendingOrdersCount === 0,
      icon: AlertTriangle,
    },
  ];

  // 3. Process Recent Orders & fetch specific Customer names
  const recent = orders.slice(0, 5);
  const userIds = [...new Set(recent.map((o: any) => o.user_id))];

  let profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    profileMap = Object.fromEntries(
      (profiles || []).map((p: any) => [p.id, p.name]),
    );
  }

  const recentOrders = recent.map((o: any) => ({
    id: o.id.slice(0, 8).toUpperCase(),
    customer: profileMap[o.user_id] || "Unknown User",
    total: Number(o.total || 0),
    status: o.status,
  }));

  // 4. Fetch Low Stock Products
  const { data: lowStockData } = await supabase
    .from("products")
    .select("name, stock")
    .lte("stock", 20) // threshold of 20
    .order("stock", { ascending: true })
    .limit(5);

  const lowStock = (lowStockData || []).map((p: any) => ({
    name: p.name,
    stock: p.stock,
    threshold: 20,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh
          intervalMs={30000}
          tables={["orders", "products", "profiles"]}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-card border border-border rounded-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.up ? "text-success" : "text-destructive"}`}
                >
                  {kpi.up ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart placeholder */}
      <div className="bg-card border border-border rounded-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-lg">Revenue Overview</h3>
          <div className="flex gap-1">
            {["Daily", "Weekly", "Monthly"].map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-1 rounded-button text-xs font-medium ${
                  i === 1
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[280px] bg-secondary/30 rounded-button flex items-center justify-center text-muted-foreground text-sm border focus:outline-none">
          📊 Revenue Chart (Recharts Dynamic Data Planned Here)
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              No recent orders found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                      Order ID
                    </th>
                    <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                      Customer
                    </th>
                    <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                      Total
                    </th>
                    <th className="py-2 text-left font-medium text-muted-foreground text-xs">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 font-medium text-primary">
                        #{order.id}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {order.customer}
                      </td>
                      <td className="py-3 font-semibold">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-card border border-border rounded-card p-6 shadow-sm">
          <h3 className="font-heading text-lg mb-4">Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-4">
              All products are well stocked.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 bg-destructive/5 rounded-button border border-destructive/10"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Threshold: {item.threshold}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-destructive">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
