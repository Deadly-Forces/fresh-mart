"use client";

import { useState, useEffect } from "react";
import { UserOrder } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteOrderAction } from "@/features/profile/actions/deleteOrder";
import { ShoppingBag, CalendarDays, Package, RefreshCw, ChevronRight, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const DeliveryCountdown = dynamic(
    () => import("@/components/ui/DeliveryCountdown").then((m) => m.DeliveryCountdown),
    { ssr: false }
);

interface ProfileOrdersTabProps {
    orders: UserOrder[];
}

export function ProfileOrdersTab({ orders }: ProfileOrdersTabProps) {
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);
    const [localOrders, setLocalOrders] = useState<UserOrder[]>(orders);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        setLocalOrders(orders);
    }, [orders]);

    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteOrderAction(orderToDelete);
            if (result.error) {
                toast.error(result.error);
            } else {
                setLocalOrders((prev) => prev.filter((o) => o.id !== orderToDelete));
                toast.success("Order deleted from history.");
            }
        } catch {
            toast.error("Failed to delete order.");
        } finally {
            setIsDeleting(false);
            setOrderToDelete(null);
        }
    };

    const handleReorder = (order: UserOrder) => {
        if (!order.items || order.items.length === 0) return;

        let addedCount = 0;
        order.items.forEach((item) => {
            if (!item.product_id) return;
            const snapshot = item.product_snapshot as any;
            addItem({
                productId: item.product_id,
                name: String(snapshot?.name || "Unknown Product"),
                price: item.price,
                quantity: item.quantity,
                image: String(snapshot?.images?.[0] || snapshot?.image || ""),
                unit: String(snapshot?.unit || "item"),
            });
            addedCount++;
        });

        if (addedCount > 0) {
            toast.success("Items added to cart!");
            router.push("/cart");
        } else {
            toast.error("Could not find product details to reorder.");
        }
    };

    if (localOrders.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-primary/30" />
                </div>
                <h3 className="text-2xl font-heading font-bold">No orders yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Start shopping to see your order history here. We&apos;ve got
                    fresh groceries waiting for you!
                </p>
                <Button
                    variant="default"
                    className="mt-6 font-semibold gap-2 h-12 px-8 text-base"
                    asChild
                >
                    <Link href="/">
                        <ShoppingBag className="w-4 h-4" /> Start Shopping
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {localOrders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
                    >
                        {/* Calculate continuous percentage correctly handling Next.js hydration */}
                        {(() => {
                            const createdMs = new Date(order.created_at).getTime();
                            // 15 minutes matching DeliveryCountdown
                            const deliveryWindowMs = 15 * 60 * 1000;

                            let progressPercent = 0;
                            if (now === null) {
                                // Initial hydration: show stable server state depending on status
                                progressPercent = order.status === "delivered" || order.status === "cancelled" ? 100
                                    : order.status === "out_for_delivery" ? 75
                                        : order.status === "packed" ? 50
                                            : 25;
                            } else if (order.status === "delivered" || order.status === "cancelled") {
                                progressPercent = 100;
                            } else {
                                const elapsed = now - createdMs;
                                const rawPercent = (elapsed / deliveryWindowMs) * 100;
                                progressPercent = Math.min(100, Math.max(0, rawPercent));

                                // Add minimum widths for intermediate steps so the visual tracker stays logical
                                if (order.status === "confirmed") progressPercent = Math.max(progressPercent, 10);
                                if (order.status === "packed") progressPercent = Math.max(progressPercent, 50);
                                if (order.status === "out_for_delivery") progressPercent = Math.max(progressPercent, 75);
                            }

                            return (
                                <>
                                    {/* Order status strip */}
                                    <div
                                        className={`h-1 transition-all duration-1000 ease-linear rounded-tl-2xl ${order.status === "delivered"
                                            ? "bg-gradient-to-r from-green-400 to-emerald-500 rounded-tr-2xl"
                                            : order.status === "cancelled"
                                                ? "bg-gradient-to-r from-red-400 to-red-500 rounded-tr-2xl"
                                                : "bg-gradient-to-r from-blue-400 to-primary"
                                            }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />

                                    <div className="p-6">
                                        {/* Order status step tracker */}
                                        {order.status !== "cancelled" && (
                                            <div className="mb-5">
                                                <div className="flex items-center justify-between relative">
                                                    {/* Connecting line */}
                                                    <div className="absolute top-3 left-[16px] right-[16px] h-0.5 bg-border" />
                                                    <div
                                                        className="absolute top-3 left-[16px] h-0.5 bg-primary transition-all duration-1000 ease-linear"
                                                        style={{ width: `calc(${progressPercent}% - 32px)` }}
                                                    />
                                                    {/* Steps */}
                                                    {[
                                                        { key: "confirmed", label: "Confirmed", threshold: 10 },
                                                        { key: "packed", label: "Packed", threshold: 45 },
                                                        { key: "out_for_delivery", label: "Shipping", threshold: 75 },
                                                        { key: "delivered", label: "Delivered", threshold: 100 },
                                                    ].map((step, index, arr) => {
                                                        // Determine visual state entirely from the interpolated progress line
                                                        const isComplete = progressPercent >= step.threshold || progressPercent === 100;

                                                        // Find the active index by finding the last step whose threshold is met
                                                        let activeIndex = 0;
                                                        if (progressPercent >= 100) activeIndex = 3;
                                                        else if (progressPercent >= 75) activeIndex = 2;
                                                        else if (progressPercent >= 45) activeIndex = 1;
                                                        else activeIndex = 0;

                                                        const isActive = index === activeIndex;

                                                        return (
                                                            <div
                                                                key={step.key}
                                                                className="flex flex-col items-center gap-1.5 relative z-10"
                                                            >
                                                                <div
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${isComplete || isActive
                                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                                        : "bg-background border-2 border-border text-muted-foreground"
                                                                        }`}
                                                                >
                                                                    {isComplete ? (
                                                                        <span>✓</span>
                                                                    ) : isActive ? (
                                                                        <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                                                                    ) : (
                                                                        <span />
                                                                    )}
                                                                </div>
                                                                <span
                                                                    className={`text-[10px] font-medium ${isComplete ? "text-primary" : "text-muted-foreground"}`}
                                                                >
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <h4 className="font-heading font-bold text-lg">
                                                        Order #{order.id.slice(0, 8).toUpperCase()}
                                                    </h4>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "delivered"
                                                            ? "bg-green-100 text-green-700 border border-green-200"
                                                            : order.status === "cancelled"
                                                                ? "bg-red-100 text-red-700 border border-red-200"
                                                                : "bg-blue-100 text-blue-700 border border-blue-200"
                                                            }`}
                                                    >
                                                        {order.status.replace("_", " ")}
                                                    </span>
                                                    <DeliveryCountdown createdAt={order.created_at} status={order.status} />
                                                </div>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <p className="text-sm text-muted-foreground font-body flex items-center gap-1.5">
                                                        <CalendarDays className="w-3.5 h-3.5" />
                                                        {(() => {
                                                            const d = new Date(order.created_at);
                                                            const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                                            const h = d.getUTCHours();
                                                            const ampm = h >= 12 ? "PM" : "AM";
                                                            const h12 = h % 12 || 12;
                                                            return `${mo[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}, ${String(h12).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} ${ampm}`;
                                                        })()}
                                                    </p>
                                                    {order.payment_method === "cod" && (
                                                        <p className="text-xs font-medium flex items-center gap-1.5">
                                                            {order.payment_status === "pending" ? (
                                                                <span className="text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-sm">
                                                                    💵 Payment Due on Delivery
                                                                </span>
                                                            ) : (
                                                                <span className="text-green-600 bg-green-100/50 px-2 py-0.5 rounded-sm">
                                                                    ✅ Paid via COD
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="text-2xl font-heading font-bold text-primary" suppressHydrationWarning>
                                                    ₹
                                                    {order.total.toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {order.items && order.items.length > 0 && (
                                            <div className="pt-4 border-t border-border/50 mt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-muted-foreground" />
                                                        {order.items.length} Item
                                                        {order.items.length !== 1 ? "s" : ""}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1.5 h-8 text-xs font-semibold rounded-full active:scale-95 transition-transform"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleReorder(order);
                                                        }}
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" /> Reorder
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {order.items.slice(0, 3).map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex justify-between items-center text-sm bg-secondary/30 rounded-lg px-3 py-2"
                                                        >
                                                            <span className="text-foreground">
                                                                <span className="font-semibold text-primary">
                                                                    {item.quantity}x
                                                                </span>{" "}
                                                                {String(
                                                                    item.product_snapshot?.name ||
                                                                    "Unknown Product",
                                                                )}
                                                            </span>
                                                            <span className="font-semibold" suppressHydrationWarning>
                                                                ₹
                                                                {(item.price * item.quantity).toLocaleString(
                                                                    "en-IN",
                                                                    { minimumFractionDigits: 2 },
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                                                            <ChevronRight className="w-3 h-3" />{" "}
                                                            {order.items.length - 3} more items
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Delete order button — always visible */}
                                        <div className="pt-4 border-t border-border/50 mt-4 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 h-8 text-xs font-semibold rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30 active:scale-95 transition-all"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setOrderToDelete(order.id);
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete Order
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                ))}
            </div>

            {/* ═══════ DELETE ORDER CONFIRMATION DIALOG ═══════ */}
            <Dialog open={!!orderToDelete} onOpenChange={(open) => { if (!open) setOrderToDelete(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this order from your history? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setOrderToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteOrder}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                            ) : (
                                <><Trash2 className="w-4 h-4" /> Delete Order</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
