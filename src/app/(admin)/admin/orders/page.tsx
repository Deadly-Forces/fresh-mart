import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

const orderStatusTabs = ["all", "processing", "packed", "out_for_delivery", "delivered", "cancelled"] as const;

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    // Fetch orders (no FK join to profiles — fetch separately to handle both schema variants)
    const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at, user_id, order_items(id)")
        .order("created_at", { ascending: false });

    const rawOrders = ordersData || [];

    // Fetch profiles separately using user_ids
    const userIds = [...new Set(rawOrders.map((o: any) => o.user_id).filter(Boolean))];
    let profileMap: Record<string, { name: string; phone: string }> = {};
    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, name, phone")
            .in("id", userIds);
        profileMap = Object.fromEntries(
            (profiles || []).map((p: any) => [p.id, { name: p.name || "Unknown", phone: p.phone || "N/A" }])
        );
    }

    const orders = rawOrders.map((o: any) => ({
        id: o.id.slice(0, 8).toUpperCase(),
        fullId: o.id,
        customer: profileMap[o.user_id]?.name || "Unknown User",
        phone: profileMap[o.user_id]?.phone || "N/A",
        items: Array.isArray(o.order_items) ? o.order_items.length : 0,
        total: Number(o.total || 0),
        status: o.status || "processing",
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-2">
                <AutoRefresh intervalMs={30000} tables={["orders"]} />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {orderStatusTabs.map((tab) => (
                    <button
                        key={tab}
                        className={`px-3 py-1.5 rounded-pill text-xs font-medium border transition-colors capitalize ${tab === "all"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary"
                            }`}
                    >
                        {tab === "all" ? `All (${orders.length})` : `${tab.replace(/_/g, " ")} (${orders.filter((o) => o.status === tab).length})`}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search orders by ID or customer..." className="pl-9 h-10" />
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Order ID</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Customer</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Items</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Total</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders found.</td>
                                </tr>
                            ) : orders.map((o) => (
                                <tr key={o.fullId} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-primary">#{o.id}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{o.customer}</p>
                                        <p className="text-xs text-muted-foreground">{o.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{o.items}</td>
                                    <td className="px-4 py-3 font-semibold">${o.total.toFixed(2)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/orders/${o.fullId}`} className="text-xs text-primary hover:underline transition-colors">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
                    Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
                </div>
            </div>
        </div>
    );
}
