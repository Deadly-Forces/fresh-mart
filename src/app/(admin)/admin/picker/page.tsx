import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { DeliveryCountdown } from "@/components/ui/DeliveryCountdown";
import { simulateOrderList } from "@/lib/orders/simulateProgress";
import {
  ListChecks,
  Package,
  Clock,
  CheckCircle2,
  User,
  AlertCircle,
  Layers,
  Timer,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPickerPage() {
  const supabase = await createClient();

  // Fetch orders that need picking: pending & confirmed
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select(
      `id, total, status, created_at, user_id,
            order_items(id, quantity, price, product_snapshot)`,
    )
    .in("status", ["pending", "confirmed"])
    .order("created_at", { ascending: true }); // oldest first = most urgent

  // Fetch recently packed orders (last 24h)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: packedOrders } = await supabase
    .from("orders")
    .select(`*, order_items ( quantity, price, product_snapshot )`)
    .eq("status", "packed")
    .gte("created_at", yesterday)
    .order("created_at", { ascending: false });

  const pending = simulateOrderList(pendingOrders || []);
  const packed = simulateOrderList(packedOrders || []);

  // Fetch profiles
  const allUserIds = [
    ...new Set(
      [...pending, ...packed].map((o: any) => o.user_id).filter(Boolean),
    ),
  ];
  let profileMap: Record<string, { name: string }> = {};
  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", allUserIds);
    profileMap = Object.fromEntries(
      (profiles || []).map((p: any) => [p.id, { name: p.name || "Unknown" }]),
    );
  }

  const mapPendingOrder = (o: any) => {
    const items = Array.isArray(o.order_items) ? o.order_items : [];
    const totalQty = items.reduce(
      (sum: number, it: any) => sum + (it.quantity || 0),
      0,
    );
    const minutesAgo = Math.round(
      (/* eslint-disable-next-line react-hooks/purity */
      (Date.now() - new Date(o.created_at).getTime())) / 60000,
    );

    return {
      id: o.id,
      shortId: o.id.slice(0, 8).toUpperCase(),
      customer: profileMap[o.user_id]?.name || "Unknown",
      itemCount: items.length,
      totalQty,
      total: Number(o.total || 0),
      status: o.status || "pending",
      minutesAgo,
      isUrgent: minutesAgo > 30,
      createdAt: o.created_at,
      items: items.slice(0, 5).map((it: any) => ({
        name: String((it.product_snapshot as any)?.name || "Unknown"),
        qty: it.quantity,
      })),
      moreItems: Math.max(0, items.length - 5),
    };
  };

  const mapPackedOrder = (o: any) => ({
    id: o.id,
    shortId: o.id.slice(0, 8).toUpperCase(),
    customer: profileMap[o.user_id]?.name || "Unknown",
    items: Array.isArray(o.order_items) ? o.order_items.length : 0,
    total: Number(o.total || 0),
    status: o.status,
    createdAt: o.created_at,
  });

  const pendingList = pending
    .map(mapPendingOrder)
    .filter((o) => o.status === "pending" || o.status === "confirmed");
  const packedList = packed
    .map(mapPackedOrder)
    .filter((o) => o.status === "packed");

  const pendingCount = pendingList.filter((o) => o.status === "pending").length;
  const confirmedCount = pendingList.filter(
    (o) => o.status === "confirmed",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">
              Picker Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick and pack orders for delivery
            </p>
          </div>
        </div>
        <AutoRefresh intervalMs={30000} tables={["orders"]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Pending
            </span>
          </div>
          <p className="text-3xl font-heading font-bold text-amber-600">
            {pendingCount}
          </p>
        </div>
        <div className="bg-card border border-border rounded-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Confirmed
            </span>
          </div>
          <p className="text-3xl font-heading font-bold text-blue-600">
            {confirmedCount}
          </p>
        </div>
        <div className="bg-card border border-border rounded-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Packed Today
            </span>
          </div>
          <p className="text-3xl font-heading font-bold text-emerald-600">
            {packedList.length}
          </p>
        </div>
      </div>

      {/* Orders to Pick */}
      <section>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Orders to Pick ({pendingList.length})
        </h2>

        {pendingList.length === 0 ? (
          <div className="bg-card border border-border rounded-card p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              All orders have been picked!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              New pending orders will appear here automatically
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingList.map((order) => (
              <div
                key={order.id}
                className={`bg-card border rounded-card shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                  order.isUrgent
                    ? "border-red-200 dark:border-red-500/20"
                    : "border-border"
                }`}
              >
                <div
                  className={`h-1 ${
                    order.isUrgent
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : "bg-gradient-to-r from-primary to-emerald-500"
                  }`}
                />
                <div className="p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base flex items-center gap-1.5">
                        #{order.shortId}
                        {order.isUrgent && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {order.customer}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-pill flex items-center gap-1 ${
                          order.isUrgent
                            ? "bg-red-500/10 text-red-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Timer className="w-3 h-3" />
                        {order.minutesAgo}m ago
                      </span>
                    </div>
                  </div>

                  {/* Item summary */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {order.itemCount} items
                    </span>
                    <span>•</span>
                    <span>{order.totalQty} units total</span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Item list preview */}
                  <div className="bg-secondary/40 rounded-xl p-3 border border-border/40 space-y-1.5">
                    {order.items.map(
                      (item: { name: string; qty: number }, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground truncate">
                            {item.name}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground shrink-0 ml-2">
                            ×{item.qty}
                          </span>
                        </div>
                      ),
                    )}
                    {order.moreItems > 0 && (
                      <p className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                        +{order.moreItems} more items
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Packed Today */}
      <section>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Packed Today ({packedList.length})
        </h2>

        {packedList.length === 0 ? (
          <div className="bg-card border border-border rounded-card p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No orders packed today yet
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                    Packed At
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {packedList.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-primary">
                      #{o.shortId}
                    </td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {o.items}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{o.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(o.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} />
                        <DeliveryCountdown createdAt={o.createdAt} status={o.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
              {packedList.length} order{packedList.length !== 1 ? "s" : ""}{" "}
              packed
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
