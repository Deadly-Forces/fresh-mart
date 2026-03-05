import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { simulateOrderList, syncOrderStatuses } from "@/lib/orders/simulateProgress";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // Auto-advance order statuses in the database
  await syncOrderStatuses();
  let ordersData: any[] | null = null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, total, subtotal, discount_amount, applied_promocode, status, payment_status, created_at, user_id, order_items(id)")
      .order("created_at", { ascending: false });
    if (!error) {
      ordersData = data;
    }
  } catch (err) {
    console.warn("Orders fetch failed:", err);
  }

  const rawOrders = simulateOrderList(ordersData || []);

  // Fetch profiles separately using user_ids
  const userIds = [
    ...new Set(rawOrders.map((o: any) => o.user_id).filter(Boolean)),
  ];
  let profileMap: Record<string, { name: string; phone: string }> = {};
  if (userIds.length > 0) {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, name, phone")
        .in("id", userIds);

      if (!error && profiles) {
        profileMap = Object.fromEntries(
          profiles.map((p: any) => [
            p.id,
            { name: p.name || "Unknown", phone: p.phone || "N/A" },
          ]),
        );
      }
    } catch (err) {
      console.warn("Profiles fetch failed:", err);
    }
  }

  const orders = rawOrders.map((o: any) => ({
    id: o.id.slice(0, 8).toUpperCase(),
    fullId: o.id,
    customer: profileMap[o.user_id]?.name || "Unknown User",
    phone: profileMap[o.user_id]?.phone || "N/A",
    items: Array.isArray(o.order_items) ? o.order_items.length : 0,
    total: Number(o.total || 0),
    subtotal: Number(o.subtotal || 0),
    discountAmount: Number(o.discount_amount || 0),
    appliedPromocode: o.applied_promocode || null,
    status: o.status || "processing",
    paymentStatus: o.payment_status || o.paymentStatus || "pending",
    createdAt: o.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh intervalMs={30000} tables={["orders"]} />
      </div>
      <OrdersClient orders={orders} />
    </div>
  );
}

