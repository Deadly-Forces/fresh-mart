"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, User, MapPin, CreditCard, Clock, ReceiptText, Save } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Image from "next/image";
import { updateOrderStatusAction } from "@/features/admin/actions/productActions";

interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    snapshot: any;
}

interface OrderDetail {
    id: string;
    shortId: string;
    status: string;
    createdAt: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    appliedPromocode: string | null;
    paymentStatus: string;
    paymentMethod: string;
    notes: string | null;
    items: OrderItem[];
    customer: {
        name: string;
        phone: string;
        email: string;
    } | null;
    address: {
        formatted: string;
    } | null;
}

export function OrderDetailClient({ order }: { order: OrderDetail }) {
    const [status, setStatus] = useState(order.status);
    const [isPending, startTransition] = useTransition();
    const [statusMsg, setStatusMsg] = useState("");
    const router = useRouter();

    const statuses = [
        "pending",
        "confirmed",
        "packed",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
    ];

    const handleStatusChange = () => {
        if (status === order.status) return;
        setStatusMsg("");
        startTransition(async () => {
            const result = await updateOrderStatusAction(order.id, status as "pending" | "processing" | "confirmed" | "packed" | "out_for_delivery" | "delivered" | "cancelled");
            if (result.error) {
                setStatusMsg(result.error);
            } else {
                setStatusMsg("Status updated!");
                setTimeout(() => setStatusMsg(""), 2000);
                router.refresh();
            }
        });
    };

    const formattedDate = new Date(order.createdAt).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/orders"
                    className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary transition-colors hover:bg-secondary/30"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        Order #{order.shortId}
                        <StatusBadge status={order.status} />
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        Placed on {formattedDate}
                    </p>
                </div>
            </div>

            {/* Status Change Section */}
            <div className="bg-card border border-border rounded-card p-4 flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium">Update Status:</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    title="Order status"
                    className="h-9 px-3 rounded-md border border-border bg-background text-sm capitalize"
                >
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleStatusChange}
                    disabled={isPending || status === order.status}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                    <Save className="w-3.5 h-3.5" />
                    {isPending ? "Updating..." : "Save"}
                </button>
                {statusMsg && (
                    <span className={`text-sm ${statusMsg.includes("error") || statusMsg.includes("Error") ? "text-destructive" : "text-success"}`}>
                        {statusMsg}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer & Delivery Details */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-card p-5 h-full">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary" />
                            Customer Details
                        </h2>
                        {order.customer ? (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Name</p>
                                    <p className="font-medium text-foreground">{order.customer.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Phone</p>
                                    <p className="font-medium text-foreground">{order.customer.phone}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Email</p>
                                    <p className="font-medium text-foreground">{order.customer.email}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Guest Customer</p>
                        )}

                        <div className="h-px w-full bg-border my-5" />

                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-primary" />
                            Delivery Address
                        </h2>
                        {order.address ? (
                            <p className="text-sm text-foreground leading-relaxed">
                                {order.address.formatted}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">No address provided</p>
                        )}

                        <div className="h-px w-full bg-border my-5" />

                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Payment Info
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium uppercase text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                                    {order.paymentMethod}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${order.paymentStatus === 'paid'
                                    ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                    : 'bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                        {order.notes && (
                            <>
                                <div className="h-px w-full bg-border my-5" />
                                <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                    <ReceiptText className="w-5 h-5 text-primary" />
                                    Order Notes
                                </h2>
                                <p className="text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-border italic">
                                    "{order.notes}"
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Order Items & Summary */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-card overflow-hidden">
                        <div className="p-5 border-b border-border bg-secondary/20">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Order Items ({order.items.reduce((acc, item) => acc + item.quantity, 0)})
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-secondary/30 text-muted-foreground border-b border-border text-xs">
                                        <th className="px-5 py-3 text-left font-medium">Product</th>
                                        <th className="px-5 py-3 text-right font-medium">Price</th>
                                        <th className="px-5 py-3 text-center font-medium">Qty</th>
                                        <th className="px-5 py-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {order.items.map((item) => {
                                        const itemName = item.snapshot?.name || "Unknown Product";
                                        const itemImage = Array.isArray(item.snapshot?.images) && item.snapshot.images.length > 0
                                            ? item.snapshot.images[0]
                                            : null;
                                        const itemUnit = item.snapshot?.unit || "";

                                        return (
                                            <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-12 h-12 rounded-lg border border-border overflow-hidden bg-secondary">
                                                            {itemImage ? (
                                                                <Image
                                                                    src={itemImage}
                                                                    alt={itemName}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="48px"
                                                                />
                                                            ) : (
                                                                <Package className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground line-clamp-1">{itemName}</p>
                                                            {itemUnit && <p className="text-xs text-muted-foreground mt-0.5">{itemUnit}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right text-muted-foreground">
                                                    ₹{item.price.toFixed(2)}
                                                </td>
                                                <td className="px-5 py-4 text-center font-medium">
                                                    x{item.quantity}
                                                </td>
                                                <td className="px-5 py-4 text-right font-semibold text-foreground">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-secondary/20 p-5 mt-auto border-t border-border">
                            <div className="space-y-3 max-w-sm ml-auto">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-medium">+ ₹{order.deliveryFee.toFixed(2)}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            Discount
                                            {order.appliedPromocode && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-mono border border-primary/20">
                                                    {order.appliedPromocode}
                                                </span>
                                            )}
                                        </span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                            - ₹{order.discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-foreground">Total</span>
                                    <span className="text-xl font-bold tracking-tight text-primary">₹{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
