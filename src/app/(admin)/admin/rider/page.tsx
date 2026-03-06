import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { DeliveryCountdown } from "@/components/ui/DeliveryCountdown";
import {
  Navigation2,
  MapPin,
  Package,
  User,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  Star,
  ChevronDown,
} from "lucide-react";

import { simulateOrderList } from "@/lib/orders/simulateProgress";

export const dynamic = "force-dynamic";

export default async function AdminRiderPage() {
  const supabase = await createClient();

  // Fetch orders relevant to rider:
  // packed = ready at store, awaiting rider pickup
  // out_for_delivery = rider accepted and en-route
  // delivered = completed (last 24h)
  const { data: activeOrders } = await supabase
    .from("orders")
    .select(
      "id, total, status, created_at, user_id, address_id, order_items(id)",
    )
    .in("status", ["packed", "out_for_delivery", "delivered"])
    .order("created_at", { ascending: false });

  // Use raw DB data — real statuses set by Picker/Rider apps
  const simOrders = activeOrders || [];

  // Fetch profiles
  const allUserIds = [
    ...new Set(simOrders.map((o: any) => o.user_id).filter(Boolean)),
  ];
  let profileMap: Record<string, { name: string; phone: string }> = {};
  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, phone")
      .in("id", allUserIds);
    profileMap = Object.fromEntries(
      (profiles || []).map((p: any) => [
        p.id,
        { name: p.name || "Unknown", phone: p.phone || "No phone" },
      ]),
    );
  }

  // Fetch addresses for active orders
  const addressIds = [
    ...new Set(simOrders.map((o: any) => o.address_id).filter(Boolean)),
  ];
  let addressMap: Record<
    string,
    { street: string; city: string; pincode: string }
  > = {};
  if (addressIds.length > 0) {
    const { data: addresses } = await supabase
      .from("addresses")
      .select("id, street, city, pincode, building, area")
      .in("id", addressIds);
    addressMap = Object.fromEntries(
      (addresses || []).map((a: any) => [
        a.id,
        {
          street:
            [a.building, a.street, a.area].filter(Boolean).join(", ") || "N/A",
          city: a.city || "",
          pincode: a.pincode || "",
        },
      ]),
    );
  }

  const mapOrder = (o: any) => {
    return {
      id: o.id,
      shortId: o.id.slice(0, 8).toUpperCase(),
      customer: profileMap[o.user_id]?.name || 'Unknown',
      phone: profileMap[o.user_id]?.phone || 'N/A',
      address: addressMap[o.address_id] || null,
      items: Array.isArray(o.order_items) ? o.order_items.length : 0,
      total: Number(o.total || 0),
      status: o.status,
      createdAt: o.created_at,
    };
  };

  const packedList = simOrders
    .filter((o: any) => o.status === 'packed')
    .map(mapOrder);
  const activeList = simOrders
    .filter((o: any) => o.status === 'out_for_delivery')
    .map(mapOrder);
  const deliveredList = simOrders
    .filter((o: any) => o.status === 'delivered')
    .map(mapOrder);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Rider Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Track active deliveries and completed orders
            </p>
          </div>
        </div>
        <AutoRefresh intervalMs={15000} tables={["orders"]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Awaiting Pickup</span>
          </div>
          <p className="text-3xl font-heading font-bold text-amber-600">{packedList.length}</p>
        </div>
        <div className="bg-card border border-border rounded-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Navigation2 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Active Deliveries</span>
          </div>
          <p className="text-3xl font-heading font-bold text-blue-600">{activeList.length}</p>
        </div>
        <div className="bg-card border border-border rounded-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Delivered</span>
          </div>
          <p className="text-3xl font-heading font-bold text-emerald-600">{deliveredList.length}</p>
        </div>
      </div>

      {/* Active Deliveries */}
      <section>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <Navigation2 className="w-4 h-4 text-blue-500" />
          Active Deliveries ({activeList.length})
        </h2>

        {activeList.length === 0 ? (
          <div className="bg-card border border-border rounded-card p-12 text-center">
            <Truck className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No active deliveries</p>
            <p className="text-xs text-muted-foreground mt-1">
              Orders marked for delivery will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeList.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-blue-200 dark:border-blue-500/20 rounded-card shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-1 bg-gradient-to-r from-blue-500 to-primary" />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        #{order.shortId}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {order.customer}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={order.status} />
                      <DeliveryCountdown createdAt={order.createdAt} status={order.status} />
                    </div>
                  </div>

                  {order.address && (
                    <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground bg-secondary/40 rounded-lg p-2.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        {order.address.street}
                        {order.address.city && `, ${order.address.city}`}
                        {order.address.pincode && ` - ${order.address.pincode}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {order.items} items
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">
                      ₹{order.total.toFixed(2)}
                    </span>
                    {order.phone !== "N/A" && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delivered */}
      <section>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Recently Delivered ({deliveredList.length})
        </h2>

        {deliveredList.length === 0 ? (
          <div className="bg-card border border-border rounded-card p-8 text-center">
            <p className="text-muted-foreground text-sm">No deliveries completed yet</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Items</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deliveredList.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary">#{o.shortId}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.items}</td>
                    <td className="px-4 py-3 font-semibold">₹{o.total.toFixed(2)}</td>
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
              {deliveredList.length} delivery{deliveredList.length !== 1 ? "ies" : "y"} completed
            </div>
          </div>
        )}
      </section>
    </div>
  );
}