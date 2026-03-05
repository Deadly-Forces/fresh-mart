"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DeliveryCountdown } from "@/components/ui/DeliveryCountdown";
import { updateOrderStatusAction } from "@/features/admin/actions/productActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ORDER_STATUSES = [
    "processing",
    "packed",
    "out_for_delivery",
    "delivered",
    "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

const orderStatusTabs = [
    "all",
    ...ORDER_STATUSES,
] as const;

type FilterTab = (typeof orderStatusTabs)[number];

interface OrderRow {
    id: string;
    fullId: string;
    customer: string;
    phone: string;
    items: number;
    total: number;
    subtotal: number;
    discountAmount: number;
    appliedPromocode: string | null;
    status: string;
    createdAt: string;
}

export function OrdersClient({ orders: initialOrders }: { orders: OrderRow[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();

    const filteredOrders = orders.filter((o) => {
        if (filter !== "all" && o.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                o.id.toLowerCase().includes(q) ||
                o.customer.toLowerCase().includes(q) ||
                o.phone.includes(q)
            );
        }
        return true;
    });

    const handleStatusChange = (orderId: string, fullId: string, newStatus: OrderStatus) => {
        setPendingIds((prev) => new Set(prev).add(fullId));
        startTransition(async () => {
            const result = await updateOrderStatusAction(fullId, newStatus);
            if (result.error) {
                toast.error(result.error);
            } else {
                setOrders((prev) =>
                    prev.map((o) =>
                        o.fullId === fullId ? { ...o, status: newStatus } : o,
                    ),
                );
                toast.success(`Order #${orderId} → ${newStatus.replace(/_/g, " ")}`);
            }
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(fullId);
                return next;
            });
        });
    };

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {orderStatusTabs.map((tab) => {
                    const count =
                        tab === "all"
                            ? orders.length
                            : orders.filter((o) => o.status === tab).length;
                    return (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={cn(
                                "px-3 py-1.5 rounded-pill text-xs font-medium border transition-colors capitalize",
                                filter === tab
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-foreground border-border hover:border-primary",
                            )}
                        >
                            {tab === "all" ? "All" : tab.replace(/_/g, " ")} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search orders by ID or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10"
                />
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-card overflow-hidden">
                <div className="overflow-x-auto">
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
                                    Discount
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                                    Change Status
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        {search
                                            ? "No orders match your search."
                                            : "No orders found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((o) => (
                                    <tr
                                        key={o.fullId}
                                        className="hover:bg-secondary/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium text-primary">
                                            #{o.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{o.customer}</p>
                                            <p className="text-xs text-muted-foreground">{o.phone}</p>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {o.items}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            ₹{o.total.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {o.discountAmount > 0 ? (
                                                <div>
                                                    <span className="text-emerald-600 font-medium text-xs">-₹{o.discountAmount.toFixed(2)}</span>
                                                    {o.appliedPromocode && (
                                                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{o.appliedPromocode}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={o.status} />
                                                <DeliveryCountdown
                                                    createdAt={o.createdAt}
                                                    status={o.status}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={o.status}
                                                disabled={pendingIds.has(o.fullId)}
                                                aria-label={`Change status for order #${o.id}`}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        o.id,
                                                        o.fullId,
                                                        e.target.value as OrderStatus,
                                                    )
                                                }
                                                className={cn(
                                                    "h-8 px-2 rounded-lg border border-border bg-background text-xs font-medium",
                                                    "focus:outline-none focus:ring-2 focus:ring-primary/30",
                                                    pendingIds.has(o.fullId) && "opacity-50 cursor-not-allowed",
                                                )}
                                            >
                                                {ORDER_STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s.replace(/_/g, " ")}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/orders/${o.fullId}`}
                                                className="text-xs text-primary hover:underline transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
                    Showing {filteredOrders.length} of {orders.length} order
                    {orders.length !== 1 ? "s" : ""}
                </div>
            </div>
        </div>
    );
}
