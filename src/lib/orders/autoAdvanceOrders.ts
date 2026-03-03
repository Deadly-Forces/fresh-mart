import { createClient } from "@/lib/supabase/server";

/**
 * Auto-advances order statuses based on elapsed time since creation.
 * Timeline: 0-2m pending, 2-5m confirmed, 5-9m packed,
 *           9-13m out_for_delivery, 13m+ delivered (payment = paid).
 * Calls a SECURITY DEFINER DB function so it works for any authenticated user.
 */
export async function autoAdvanceOrders() {
  try {
    const supabase = await createClient();
    // RPC function exists in DB but not in generated types
    await (supabase.rpc as Function)("auto_advance_orders");
  } catch (e) {
    // Silently ignore — auto-advance is best-effort
    console.error("auto_advance_orders failed:", e);
  }
}
