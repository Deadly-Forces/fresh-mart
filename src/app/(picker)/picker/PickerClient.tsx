"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { markOrderPackedAction } from "@/features/staff/actions/staffOrderActions";
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Timer,
  Package,
  CircleCheck,
  Circle,
  AlertCircle,
  Layers,
  Zap,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────
interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  product_snapshot: { name?: string; unit?: string } | null;
}

interface PickerOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  notes: string | null;
  delivery_slot: string | null;
  profiles: { name: string | null; phone: string | null } | null;
  addresses: {
    building: string | null;
    street: string | null;
    area: string | null;
    city: string | null;
  } | null;
  order_items: OrderItem[];
}

interface PickerClientProps {
  initialOrders: PickerOrder[];
  pickerName: string;
}

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────
function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function dueIn(createdAt: string) {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const remaining = Math.max(0, 20 * 60 * 1000 - elapsed); // 20 min window
  const mins = Math.floor(remaining / 60000);
  return remaining <= 0 ? "Overdue" : `${mins}m`;
}

function isUrgent(createdAt: string) {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  return elapsed > 15 * 60 * 1000; // urgent if >15 mins old
}

// ──────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────
export function PickerClient({ initialOrders, pickerName }: PickerClientProps) {
  const [orders, setOrders] = useState<PickerOrder[]>(initialOrders);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [completingId, setCompletingId] = useState<string | null>(null);

  // AI Alternatives State
  const [unavailableItemId, setUnavailableItemId] = useState<string | null>(
    null,
  );
  const [alternatives, setAlternatives] = useState<
    { name: string; reason: string }[] | null
  >(null);
  const [isGeneratingAlternatives, setIsGeneratingAlternatives] =
    useState(false);

  // ── Realtime subscription ──
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("picker-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `status=in.(processing,confirmed,packed)`,
        },
        () => {
          // Re-fetch on any change to the relevant orders
          supabase
            .from("orders")
            .select(
              `
                            id, status, total, created_at, notes, delivery_slot,
                            profiles:user_id ( name, phone ),
                            addresses:address_id ( building, street, area, city ),
                            order_items ( id, product_id, quantity, price, product_snapshot )
                        `,
            )
            .in("status", ["processing", "confirmed", "packed"])
            .order("created_at", { ascending: true })
            .then(({ data }) => {
              if (data) setOrders(data as unknown as PickerOrder[]);
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Derived state ──
  const queue = orders.filter((o) =>
    ["processing", "confirmed"].includes(o.status),
  );
  const activeOrder = activeOrderId
    ? orders.find((o) => o.id === activeOrderId)
    : null;
  const completed = orders.filter((o) => o.status === "packed");

  // Stats
  const todayPicked = completed.length;
  const pendingCount = queue.length;

  // ── Actions ──
  function handleStartPicking(orderId: string) {
    setActiveOrderId(orderId);
  }

  function handleMarkComplete(orderId: string) {
    setCompletingId(orderId);
    startTransition(async () => {
      const result = await markOrderPackedAction(orderId);
      if (!result.error) {
        // Optimistic: move from active to completed locally
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "packed" } : o)),
        );
        setActiveOrderId(null);
      }
      setCompletingId(null);
    });
  }

  async function handleGenerateAlternatives(item: OrderItem) {
    setUnavailableItemId(item.id);
    setIsGeneratingAlternatives(true);
    setAlternatives(null);

    const name =
      (item.product_snapshot as { name?: string } | null)?.name ||
      "Unknown Product";

    try {
      const res = await fetch("/api/ai/replacements", {
        method: "POST",
        body: JSON.stringify({ productName: name }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setAlternatives(data.alternatives || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAlternatives(false);
    }
  }

  // ──────────────────────────────────────────
  //  Render
  // ──────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* ── Live Indicator ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          Hey,{" "}
          <span className="text-foreground font-semibold">{pickerName}</span>!
        </p>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Pending",
            value: String(pendingCount),
            icon: Clock,
            color: "bg-amber-500/10 text-amber-600",
          },
          {
            label: "Picked Today",
            value: String(todayPicked),
            icon: Package,
            color: "bg-emerald-500/10 text-emerald-600",
          },
          {
            label: "Active",
            value: activeOrderId ? "1" : "0",
            icon: Timer,
            color: "bg-blue-500/10 text-blue-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-3 shadow-sm border border-border/50 flex flex-col items-center text-center gap-1.5"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold text-foreground">
              {s.value}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Active Pick ── */}
      {activeOrder ? (
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Currently Picking
          </h2>

          <div className="bg-card border border-primary/20 rounded-2xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-foreground text-base">
                  ORD-{shortId(activeOrder.id)}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeOrder.profiles?.name || "Customer"} •{" "}
                  {activeOrder.addresses?.area ||
                    activeOrder.addresses?.city ||
                    "—"}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isUrgent(activeOrder.created_at)
                    ? "bg-red-500/10 text-red-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                <Clock className="w-3 h-3" />
                {dueIn(activeOrder.created_at)}
              </span>
            </div>

            {/* Progress */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground">
                  {activeOrder.order_items.length} items to pick
                </span>
                <span className="text-xs font-bold text-primary">
                  ₹{activeOrder.total.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full w-0 animate-pulse" />
              </div>
            </div>

            {/* Item list — from real order_items */}
            <div className="px-4 pb-3 space-y-2 max-h-72 overflow-y-auto">
              {activeOrder.order_items.map((item) => {
                const name =
                  (item.product_snapshot as { name?: string } | null)?.name ||
                  "Unknown Item";
                const unit =
                  (item.product_snapshot as { unit?: string } | null)?.unit ||
                  "";
                const isCheckingAlternatives = unavailableItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">
                            {name}
                          </p>
                          {unit && (
                            <p className="text-[10px] text-muted-foreground">
                              {unit}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-muted-foreground">
                          ×{item.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => handleGenerateAlternatives(item)}
                        disabled={
                          isCheckingAlternatives && isGeneratingAlternatives
                        }
                        className="text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium hover:underline disabled:opacity-50"
                      >
                        {isCheckingAlternatives && isGeneratingAlternatives ? (
                          <Loader2 className="w-3 h-3 animate-spin inline-block" />
                        ) : (
                          <Sparkles className="w-3 h-3 inline-block" />
                        )}
                        {isCheckingAlternatives && isGeneratingAlternatives
                          ? "Finding alternatives..."
                          : "Out of stock? Suggest AI Alternative"}
                      </button>
                    </div>

                    {/* AI Suggestions Box */}
                    {isCheckingAlternatives && alternatives && (
                      <div className="mt-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
                            Suggested Subs
                          </p>
                        </div>
                        {alternatives.length > 0 ? (
                          <ul className="space-y-2">
                            {alternatives.map((alt, i) => (
                              <li
                                key={i}
                                className="text-xs bg-white dark:bg-background/50 rounded p-2"
                              >
                                <span className="font-semibold text-foreground block">
                                  {alt.name}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                  {alt.reason}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No good alternatives found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => setActiveOrderId(null)}
                className="flex-1 bg-muted/60 hover:bg-muted text-foreground transition-colors font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Back to Queue
              </button>
              <button
                disabled={isPending}
                onClick={() => handleMarkComplete(activeOrder.id)}
                className="flex-1 bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground transition-all font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                {completingId === activeOrder.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Mark Packed
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Queue ── */}
      <section>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Queue ({queue.length})
        </h2>

        {queue.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              No orders in queue
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              New orders will appear here automatically
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue
              .sort((a, b) => {
                if (isUrgent(a.created_at) && !isUrgent(b.created_at))
                  return -1;
                if (!isUrgent(a.created_at) && isUrgent(b.created_at)) return 1;
                return (
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
                );
              })
              .map((order) => {
                const urgent = isUrgent(order.created_at);
                return (
                  <div
                    key={order.id}
                    className={`bg-card border rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow ${
                      urgent
                        ? "border-red-200 dark:border-red-500/30"
                        : "border-border/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          ORD-{shortId(order.id)}
                          {urgent && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.profiles?.name || "Customer"} •{" "}
                          {order.order_items.length} items
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                          urgent
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {dueIn(order.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {order.order_items
                          .slice(0, 3)
                          .map(
                            (i) =>
                              (i.product_snapshot as { name?: string } | null)
                                ?.name || "Item",
                          )
                          .join(", ")}
                        {order.order_items.length > 3
                          ? ` +${order.order_items.length - 3} more`
                          : ""}
                      </span>
                    </div>

                    <button
                      disabled={!!activeOrderId}
                      onClick={() => handleStartPicking(order.id)}
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ListChecks className="w-4 h-4" />
                      Start Picking
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* ── Packed (awaiting rider) ── */}
      <section>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3"
        >
          <span>Packed — Awaiting Rider ({completed.length})</span>
          {showCompleted ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showCompleted && (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden divide-y divide-border/50">
            {completed.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                None yet today
              </p>
            ) : (
              completed.map((o) => (
                <div
                  key={o.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      ORD-{shortId(o.id)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.profiles?.name || "Customer"} • {o.order_items.length}{" "}
                      items
                    </p>
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CircleCheck className="w-3 h-3" />
                    Packed
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
