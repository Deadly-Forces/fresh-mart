"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Timer,
  Package,
  Barcode,
  CircleCheck,
  Circle,
  AlertCircle,
  Layers,
  Zap,
} from "lucide-react";

/* ───────────────── Static Mock Data ───────────────── */

const stats = [
  {
    label: "Pending",
    value: "4",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Picked Today",
    value: "12",
    icon: Package,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    label: "Avg. Pick Time",
    value: "8m",
    icon: Timer,
    color: "bg-blue-500/10 text-blue-600",
  },
];

const activeOrder = {
  id: "ORD-2026-41K",
  customer: "Priya Sharma",
  totalItems: 14,
  pickedItems: 6,
  aisles: "2, 5, 8",
  dueIn: "25 min",
  items: [
    { name: "Organic Bananas (1 dozen)", aisle: "2", qty: 1, picked: true },
    { name: "Whole Wheat Bread 400g", aisle: "2", qty: 2, picked: true },
    { name: "Amul Butter 500g", aisle: "5", qty: 1, picked: true },
    { name: "Full Cream Milk 1L", aisle: "5", qty: 3, picked: true },
    { name: "Basmati Rice 5kg", aisle: "8", qty: 1, picked: true },
    { name: "Toor Dal 1kg", aisle: "8", qty: 1, picked: true },
    { name: "Greek Yogurt 400g", aisle: "5", qty: 2, picked: false },
    { name: "Fresh Paneer 200g", aisle: "5", qty: 1, picked: false },
    { name: "Red Onions 1kg", aisle: "2", qty: 1, picked: false },
    { name: "Tomatoes 500g", aisle: "2", qty: 1, picked: false },
  ],
};

const queuedOrders = [
  {
    id: "ORD-2026-55R",
    customer: "Amit Verma",
    items: 6,
    aisles: "1, 3",
    due: "30 min",
    urgency: "normal" as const,
  },
  {
    id: "ORD-2026-72F",
    customer: "Sneha Reddy",
    items: 18,
    aisles: "2, 4, 6, 9",
    due: "45 min",
    urgency: "normal" as const,
  },
  {
    id: "ORD-2026-89W",
    customer: "Rahul Gupta",
    items: 3,
    aisles: "7",
    due: "15 min",
    urgency: "urgent" as const,
  },
];

const completedOrders = [
  {
    id: "ORD-2026-33P",
    customer: "Meera Joshi",
    items: 9,
    time: "11:42 AM",
    duration: "7m",
  },
  {
    id: "ORD-2026-27L",
    customer: "Karan Singh",
    items: 5,
    time: "10:58 AM",
    duration: "4m",
  },
  {
    id: "ORD-2026-19D",
    customer: "Aisha Khan",
    items: 22,
    time: "10:15 AM",
    duration: "14m",
  },
];

/* ───────────────── Component ───────────────── */

export default function PickerDashboard() {
  const [showCompleted, setShowCompleted] = useState(false);

  const progressPercent = Math.round(
    (activeOrder.pickedItems / activeOrder.totalItems) * 100,
  );

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
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
                {activeOrder.id}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeOrder.customer} • Aisles {activeOrder.aisles}
              </p>
            </div>
            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activeOrder.dueIn}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground">
                {activeOrder.pickedItems}/{activeOrder.totalItems} items picked
              </span>
              <span className="text-xs font-bold text-primary">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="px-4 pb-3 space-y-1">
            {activeOrder.items.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-colors ${
                  item.picked
                    ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                {item.picked ? (
                  <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      item.picked
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
                    A{item.aisle}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    ×{item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Scan + Complete */}
          <div className="px-4 pb-4 flex gap-2">
            <button className="flex-1 bg-muted/60 hover:bg-muted text-foreground transition-colors font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
              <Barcode className="w-4 h-4" />
              Scan Item
            </button>
            <button className="flex-1 bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground transition-all font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20">
              <CheckCircle2 className="w-4 h-4" />
              Mark Complete
            </button>
          </div>
        </div>
      </section>

      {/* ── Queue ── */}
      <section>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Queue ({queuedOrders.length})
        </h2>
        <div className="space-y-3">
          {queuedOrders
            .sort((a, b) =>
              a.urgency === "urgent" ? -1 : b.urgency === "urgent" ? 1 : 0,
            )
            .map((order) => (
              <div
                key={order.id}
                className={`bg-card border rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow ${
                  order.urgency === "urgent"
                    ? "border-red-200 dark:border-red-500/30"
                    : "border-border/50"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      {order.id}
                      {order.urgency === "urgent" && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.customer} • {order.items} items
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                      order.urgency === "urgent"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {order.due}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Aisles {order.aisles}
                  </span>
                </div>

                <button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm group">
                  <ListChecks className="w-4 h-4" />
                  Start Picking
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
        </div>
      </section>

      {/* ── Completed (Collapsible) ── */}
      <section>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3"
        >
          <span>Completed Today</span>
          {showCompleted ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showCompleted && (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden divide-y divide-border/50">
            {completedOrders.map((d) => (
              <div
                key={d.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {d.id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.customer} • {d.items} items
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {d.time}
                  </span>
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {d.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
