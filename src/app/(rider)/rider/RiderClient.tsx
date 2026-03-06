"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { acceptDeliveryAction, markDeliveredAction } from "@/features/staff/actions/staffOrderActions";
import {
    MapPin,
    Box,
    ArrowRight,
    Truck,
    Clock,
    CheckCircle2,
    Navigation,
    Phone,
    User,
    ChevronDown,
    ChevronUp,
    CircleDot,
    Loader2,
    IndianRupee,
    Zap,
    Package,
} from "lucide-react";

// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────
interface RiderOrder {
    id: string;
    status: string;
    total: number;
    created_at: string;
    payment_method: string | null;
    payment_status: string | null;
    delivery_slot: string | null;
    profiles: { name: string | null; phone: string | null; email: string | null } | null;
    addresses: {
        building: string | null;
        street: string | null;
        area: string | null;
        landmark: string | null;
        city: string | null;
        pincode: string | null;
    } | null;
    order_items: { id: string; quantity: number; product_snapshot: { name?: string } | null }[];
}

interface RiderClientProps {
    initialOrders: RiderOrder[];
    riderName: string;
}

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────
function shortId(id: string) {
    return id.slice(0, 8).toUpperCase();
}

function formatAddress(addr: RiderOrder["addresses"]) {
    if (!addr) return "—";
    const parts = [addr.building, addr.street, addr.area, addr.city].filter(Boolean);
    return parts.join(", ") || "Address not available";
}

function etaFromCreated(createdAt: string) {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const windowMs = 20 * 60 * 1000;
    const remaining = Math.max(0, windowMs - elapsed);
    const mins = Math.ceil(remaining / 60000);
    return remaining <= 0 ? "Now" : `${mins} min`;
}

// ──────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────
export function RiderClient({ initialOrders, riderName }: RiderClientProps) {
    const [orders, setOrders] = useState<RiderOrder[]>(initialOrders);
    const [isOnline, setIsOnline] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [actionOrderId, setActionOrderId] = useState<string | null>(null);

    // ── Realtime subscription ──
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel("rider-orders")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "orders",
                },
                () => {
                    // Re-fetch relevant orders
                    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                    supabase
                        .from("orders")
                        .select(`
                            id, status, total, created_at, payment_method, payment_status, delivery_slot,
                            profiles:user_id ( name, phone, email ),
                            addresses:address_id ( building, street, area, landmark, city, pincode ),
                            order_items ( id, quantity, product_snapshot )
                        `)
                        .in("status", ["packed", "out_for_delivery", "delivered"])
                        .gte("created_at", cutoff)
                        .order("created_at", { ascending: true })
                        .then(({ data }) => {
                            if (data) setOrders(data as unknown as RiderOrder[]);
                        });
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // ── Derived state ──
    const activeDelivery = orders.find((o) => o.status === "out_for_delivery") ?? null;
    const pending = orders.filter((o) => o.status === "packed");
    const recent = orders.filter((o) => o.status === "delivered");

    function handleAccept(orderId: string) {
        setActionOrderId(orderId);
        startTransition(async () => {
            const result = await acceptDeliveryAction(orderId);
            if (!result.error) {
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === orderId ? { ...o, status: "out_for_delivery" } : o,
                    ),
                );
            }
            setActionOrderId(null);
        });
    }

    function handleDelivered(orderId: string) {
        setActionOrderId(orderId);
        startTransition(async () => {
            const result = await markDeliveredAction(orderId);
            if (!result.error) {
                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === orderId ? { ...o, status: "delivered", payment_status: "paid" } : o,
                    ),
                );
            }
            setActionOrderId(null);
        });
    }

    // ──────────────────────────────────────────
    //  Render
    // ──────────────────────────────────────────
    return (
        <div className="space-y-5 max-w-lg mx-auto">
            {/* ── Online / Offline Toggle ── */}
            <div
                className={`flex items-center justify-between rounded-2xl p-4 transition-colors duration-300 ${isOnline
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <p className="font-bold text-sm tracking-wide">
                        Hey, {riderName}!
                    </p>
                    {isOnline && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                    )}
                    <span className="text-xs font-medium opacity-90">
                        {isOnline ? "Online" : "Offline"}
                    </span>
                </div>
                <button
                    onClick={() => setIsOnline(!isOnline)}
                    aria-label={isOnline ? "Go offline" : "Go online"}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isOnline ? "bg-white/30" : "bg-slate-400"
                        }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isOnline ? "translate-x-6" : "translate-x-0"
                            }`}
                    />
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Delivered", value: String(recent.length), icon: Truck, color: "bg-blue-500/10 text-blue-600" },
                    { label: "Pending", value: String(pending.length), icon: Package, color: "bg-amber-500/10 text-amber-600" },
                    { label: "Earnings", value: `₹${recent.reduce((s, o) => s + o.total, 0).toFixed(0)}`, icon: IndianRupee, color: "bg-emerald-500/10 text-emerald-600" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="bg-card rounded-2xl p-3 shadow-sm border border-border/50 flex flex-col items-center text-center gap-1.5"
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                            <s.icon className="w-4 h-4" />
                        </div>
                        <span className="text-lg font-extrabold text-foreground">{s.value}</span>
                        <span className="text-[10px] text-muted-foreground font-medium leading-tight">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Active Delivery ── */}
            {activeDelivery ? (
                <section>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-blue-500" />
                        Active Delivery
                    </h2>
                    <div className="bg-card border border-blue-200 dark:border-blue-500/30 rounded-2xl shadow-md overflow-hidden">
                        <div className="px-4 pt-4 pb-3 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-foreground text-base">
                                    ORD-{shortId(activeDelivery.id)}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                    <User className="w-3 h-3" />
                                    {activeDelivery.profiles?.name || "Customer"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Box className="w-3 h-3" />
                                    {activeDelivery.order_items.length} items
                                </span>
                                {activeDelivery.profiles?.phone && (
                                    <a
                                        href={`tel:${activeDelivery.profiles.phone}`}
                                        aria-label="Call customer"
                                        className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="px-4 pb-4">
                            {/* Route */}
                            <div className="bg-secondary/30 rounded-xl p-3 border border-border/50 space-y-0 mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <CircleDot className="w-3 h-3" />
                                        </div>
                                        <div className="w-px h-6 bg-border my-1" />
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pickup</p>
                                        <p className="text-sm font-medium text-foreground">FreshMart Store</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <MapPin className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Drop-off</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {formatAddress(activeDelivery.addresses)}
                                        </p>
                                        {activeDelivery.addresses?.pincode && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                PIN: {activeDelivery.addresses.pincode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment notice */}
                            {activeDelivery.payment_method === "cod" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                                    <IndianRupee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <p className="text-xs font-semibold text-amber-700">
                                        Collect ₹{activeDelivery.total.toFixed(0)} Cash on Delivery
                                    </p>
                                </div>
                            )}

                            {/* ETA + Actions */}
                            <div className="flex gap-2 mb-3">
                                <span className="bg-secondary text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    ETA ~{etaFromCreated(activeDelivery.created_at)}
                                </span>
                            </div>

                            <button
                                disabled={isPending}
                                onClick={() => handleDelivered(activeDelivery.id)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white transition-all font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-60"
                            >
                                {actionOrderId === activeDelivery.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                )}
                                Mark as Delivered
                            </button>
                        </div>
                    </div>
                </section>
            ) : null}

            {/* ── Pending Queue (packed, awaiting acceptance) ── */}
            <section>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Ready for Pickup ({pending.length})
                </h2>

                {pending.length === 0 && !activeDelivery ? (
                    <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                        <Navigation className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">No orders ready</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Packed orders will appear here automatically
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pending.map((order) => (
                            <div
                                key={order.id}
                                className="bg-card border border-border/50 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm">
                                            ORD-{shortId(order.id)}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {order.profiles?.name || "Customer"} •{" "}
                                            {order.order_items.length} items
                                        </p>
                                    </div>
                                    <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {etaFromCreated(order.created_at)}
                                    </span>
                                </div>

                                <div className="bg-secondary/30 rounded-lg p-2.5 flex items-start gap-2 mb-3 border border-border/50">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-foreground">
                                            {formatAddress(order.addresses)}
                                        </p>
                                        {order.payment_method === "cod" && (
                                            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                                COD: ₹{order.total.toFixed(0)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    disabled={isPending || !!activeDelivery}
                                    onClick={() => handleAccept(order.id)}
                                    className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionOrderId === order.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <>Accept<ArrowRight className="w-3.5 h-3.5" /></>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Recent Deliveries ── */}
            <section>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3"
                >
                    <span>Recent Deliveries ({recent.length})</span>
                    {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHistory && (
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden divide-y divide-border/50">
                        {recent.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground text-center">No deliveries yet today</p>
                        ) : (
                            recent.map((d) => (
                                <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            ORD-{shortId(d.id)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {d.profiles?.name || "Customer"} • ₹{d.total.toFixed(0)}
                                        </p>
                                    </div>
                                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Delivered
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
