import { createClient } from "@/lib/supabase/server";

/**
 * Order status progression.
 * Stages that require MANUAL staff actions (packed, out_for_delivery, delivered)
 * are now handled by the real Picker and Rider apps.
 *
 * This auto-sync only advances gateway stages:
 *   pending    → processing  (immediate — payment received)
 *   processing → confirmed   (2 min — order accepted by store)
 *
 * Everything after confirmed is handled by the Picker/Rider apps.
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

  // Only auto-advance up to "confirmed" — Picker/Rider handle the rest
  if (elapsedMin >= 3) return { status: "confirmed", paymentStatus: "pending" };
  return { status: "processing", paymentStatus: "pending" };
}

/**
 * In-memory simulation for display only (no DB write).
 * Does NOT override stages set by Picker/Rider (packed, out_for_delivery, delivered, cancelled).
 */
export function simulateOrderProgress(order: any) {
  if (!order) return order;

  // Never override manual staff stages or cancelled
  if (["packed", "out_for_delivery", "delivered", "cancelled"].includes(order.status)) {
    return order;
  }

  const { status: newStatus, paymentStatus: newPayment } = getExpectedStatus(
    order.created_at || order.createdAt,
  );

  const currentIdx = STATUS_ORDER.indexOf(order.status as any);
  const newIdx = STATUS_ORDER.indexOf(newStatus as any);

  // Only advance to confirmed at most (newIdx <= 2)
  if (currentIdx !== -1 && newIdx !== -1 && newIdx > currentIdx && newIdx <= 2) {
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
 * ONLY advances pending → processing → confirmed.
 * Picker/Rider apps are responsible for packed, out_for_delivery, delivered.
 */
export async function syncOrderStatuses() {
  try {
    const supabase = await createClient();

    // Only fetch early-stage orders that can be auto-advanced
    const { data: activeOrders, error } = await supabase
      .from("orders")
      .select("id, status, payment_status, created_at")
      .in("status", ["pending", "processing"]); // only these two can be auto-advanced

    if (error || !activeOrders || activeOrders.length === 0) return;

    for (const order of activeOrders) {
      const { status: expectedStatus, paymentStatus: expectedPayment } =
        getExpectedStatus(order.created_at);

      const currentIdx = STATUS_ORDER.indexOf(order.status as any);
      const expectedIdx = STATUS_ORDER.indexOf(expectedStatus as any);

      // Guard: only advance, never go backwards, never go past "confirmed" (idx 2)
      if (expectedIdx > currentIdx && expectedIdx <= 2) {
        await supabase
          .from("orders")
          .update({
            status: expectedStatus as any,
            payment_status: expectedPayment,
          })
          .eq("id", order.id);
      }
    }
  } catch (err) {
    console.warn("Failed to sync order statuses:", err);
  }
}
