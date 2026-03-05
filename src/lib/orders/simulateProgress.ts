import { createClient } from "@/lib/supabase/server";

/**
 * Order status auto-progression timeline (from order creation):
 * 0 min  → processing (initial)
 * 2 min  → confirmed
 * 5 min  → packed
 * 9 min  → out_for_delivery
 * 13 min → delivered (payment marked as paid)
 *
 * This function checks elapsed time and updates the DB if the order
 * should advance. Cancelled orders are skipped.
 */

const STATUS_ORDER = [
  "pending",
  "processing",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
] as const;

export function getExpectedStatus(createdAt: string | Date): {
  status: string;
  paymentStatus: string;
} {
  const created = new Date(createdAt).getTime();
  if (isNaN(created)) return { status: "processing", paymentStatus: "pending" };

  const elapsedMin = (Date.now() - created) / 60000;

  if (elapsedMin >= 15) return { status: "delivered", paymentStatus: "paid" };
  if (elapsedMin >= 10)
    return { status: "out_for_delivery", paymentStatus: "pending" };
  if (elapsedMin >= 6) return { status: "packed", paymentStatus: "pending" };
  if (elapsedMin >= 3) return { status: "confirmed", paymentStatus: "pending" };
  return { status: "processing", paymentStatus: "pending" };
}

/**
 * In-memory simulation for display (no DB write).
 * Used when rendering pages to show the correct status instantly.
 */
export function simulateOrderProgress(order: any) {
  if (!order || order.status === "cancelled") return order;

  const created = new Date(order.created_at || order.createdAt).getTime();
  if (isNaN(created)) return order;

  const { status: newStatus, paymentStatus: newPayment } = getExpectedStatus(
    order.created_at || order.createdAt,
  );

  const currentIdx = STATUS_ORDER.indexOf(order.status as any);
  const newIdx = STATUS_ORDER.indexOf(newStatus as any);

  if (currentIdx !== -1 && newIdx !== -1 && newIdx > currentIdx) {
    return {
      ...order,
      status: newStatus,
      payment_status: newPayment,
      paymentStatus: newPayment,
    };
  }

  return order;
}

export function simulateOrderList(orders: any[]) {
  return orders.map(simulateOrderProgress);
}

/**
 * Persist auto-progression to the database.
 * Call this on page loads or via a cron/interval to keep DB in sync.
 * Only advances orders that are behind their expected status.
 */
export async function syncOrderStatuses() {
  const supabase = await createClient();

  // Fetch all non-cancelled, non-delivered orders
  const { data: activeOrders } = await supabase
    .from("orders")
    .select("id, status, payment_status, created_at")
    .not("status", "in", '("cancelled","delivered")');

  if (!activeOrders || activeOrders.length === 0) return;

  for (const order of activeOrders) {
    const { status: expectedStatus, paymentStatus: expectedPayment } =
      getExpectedStatus(order.created_at);

    const currentIdx = STATUS_ORDER.indexOf(order.status as any);
    const expectedIdx = STATUS_ORDER.indexOf(expectedStatus as any);

    // Only advance, never go backwards
    if (expectedIdx > currentIdx) {
      await supabase
        .from("orders")
        .update({
          status: expectedStatus as any,
          payment_status: expectedPayment,
        })
        .eq("id", order.id);
    }
  }
}
