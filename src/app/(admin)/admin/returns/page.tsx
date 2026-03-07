import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { ReturnsClient } from "./ReturnsClient";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const supabase = await createClient();

  // Fetch all return requests
  const { data: requestsData } = (await supabase
    .from("return_requests")
    .select("*")
    .order("created_at", { ascending: false })) as { data: any[]; error: any };

  const requests = requestsData || [];

  // Fetch related orders and profiles
  const orderIds = [...new Set(requests.map((r: any) => r.order_id))];
  const userIds = [...new Set(requests.map((r: any) => r.user_id))];

  let ordersMap: Record<string, any> = {};
  if (orderIds.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total, status")
      .in("id", orderIds);
    for (const o of orders || []) {
      ordersMap[o.id] = o;
    }
  }

  let usersMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, phone")
      .in("id", userIds);
    for (const p of profiles || []) {
      usersMap[p.id] = p;
    }
  }

  const enrichedRequests = requests.map((r: any) => {
    const order = ordersMap[r.order_id];
    const customer = usersMap[r.user_id];
    return {
      id: r.id,
      orderId: r.order_id,
      orderShortId: r.order_id?.slice(0, 8).toUpperCase() || "N/A",
      orderTotal: order ? Number(order.total || 0) : 0,
      orderStatus: order?.status || "unknown",
      customerName: customer?.name || "Unknown",
      customerEmail: customer?.email || "N/A",
      customerPhone: customer?.phone || "N/A",
      reason: r.reason,
      description: r.description || "",
      status: r.status,
      refundAmount: r.refund_amount ? Number(r.refund_amount) : null,
      adminNotes: r.admin_notes || "",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });

  const stats = {
    total: enrichedRequests.length,
    pending: enrichedRequests.filter((r: any) => r.status === "pending").length,
    approved: enrichedRequests.filter((r: any) => r.status === "approved")
      .length,
    refunded: enrichedRequests.filter((r: any) => r.status === "refunded")
      .length,
    rejected: enrichedRequests.filter((r: any) => r.status === "rejected")
      .length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh intervalMs={30000} tables={["return_requests"]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Requests</p>
        </div>
        <div className="bg-card border border-amber-200 dark:border-amber-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
          </p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-blue-200 dark:border-blue-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.approved}
          </p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </div>
        <div className="bg-card border border-emerald-200 dark:border-emerald-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.refunded}
          </p>
          <p className="text-xs text-muted-foreground">Refunded</p>
        </div>
        <div className="bg-card border border-red-200 dark:border-red-800 rounded-card p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.rejected}
          </p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </div>
      </div>

      <ReturnsClient requests={enrichedRequests} />
    </div>
  );
}
