"use client";

import { useState } from "react";
import {
  MapPin,
  Box,
  ArrowRight,
  Star,
  IndianRupee,
  Truck,
  Clock,
  CheckCircle2,
  Navigation,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Route,
  Zap,
} from "lucide-react";

/* ───────────────── Static Mock Data ───────────────── */

const stats = [
  {
    label: "Today's Deliveries",
    value: "5",
    icon: Truck,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Avg. Rating",
    value: "4.8★",
    icon: Star,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Earnings",
    value: "₹1,240",
    icon: IndianRupee,
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

const activeDelivery = {
  id: "ORD-2026-41K",
  customer: "Priya Sharma",
  items: 8,
  bags: 2,
  pickup: "FreshMart — Sector 22 Store",
  dropoff: "42-B, Green Valley Apartments, Sector 15",
  distance: "3.2 km",
  eta: "12 min",
  phone: "+91 98765 43210",
};

const pendingOrders = [
  {
    id: "ORD-2026-55R",
    customer: "Amit Verma",
    items: 4,
    bags: 1,
    dropoff: "18, Lake View Residency, MG Road",
    distance: "1.8 km",
    eta: "8 min",
    due: "15 min",
  },
  {
    id: "ORD-2026-72F",
    customer: "Sneha Reddy",
    items: 11,
    bags: 3,
    dropoff: "Plot 9, Jubilee Hills, Road No 5",
    distance: "5.1 km",
    eta: "22 min",
    due: "35 min",
  },
  {
    id: "ORD-2026-89W",
    customer: "Rahul Gupta",
    items: 3,
    bags: 1,
    dropoff: "Flat 301, Sunshine Towers, Banjara Hills",
    distance: "4.0 km",
    eta: "18 min",
    due: "40 min",
  },
];

const recentDeliveries = [
  {
    id: "ORD-2026-33P",
    customer: "Meera Joshi",
    time: "11:42 AM",
    status: "Delivered",
    rating: 5,
  },
  {
    id: "ORD-2026-27L",
    customer: "Karan Singh",
    time: "10:15 AM",
    status: "Delivered",
    rating: 4,
  },
  {
    id: "ORD-2026-19D",
    customer: "Aisha Khan",
    time: "9:30 AM",
    status: "Delivered",
    rating: 5,
  },
];

/* ───────────────── Component ───────────────── */

export default function RiderDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* ── Online / Offline Toggle ── */}
      <div
        className={`flex items-center justify-between rounded-2xl p-4 transition-colors duration-300 ${
          isOnline
            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
            : "bg-slate-200 text-slate-600"
        }`}
      >
        <div className="flex items-center gap-3">
          {isOnline && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
          )}
          <span className="font-bold text-sm tracking-wide">
            {isOnline ? "You're Online" : "You're Offline"}
          </span>
        </div>
        <button
          onClick={() => setIsOnline(!isOnline)}
          aria-label={isOnline ? "Go offline" : "Go online"}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            isOnline ? "bg-white/30" : "bg-slate-400"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
              isOnline ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-1.5"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">
              {s.value}
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Active Delivery ── */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-500" />
          Active Delivery
        </h2>
        <div className="bg-white border border-blue-100 rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {activeDelivery.id}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <User className="w-3 h-3" />
                {activeDelivery.customer}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Box className="w-3 h-3" />
                {activeDelivery.bags} Bags
              </span>
              <a
                href={`tel:${activeDelivery.phone}`}
                aria-label="Call customer"
                className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Route Step Indicator */}
          <div className="px-4 pb-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-0">
              {/* Pickup */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CircleDot className="w-3 h-3" />
                  </div>
                  <div className="w-px h-6 bg-slate-200 my-1" />
                </div>
                <div className="pb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pickup
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {activeDelivery.pickup}
                  </p>
                </div>
              </div>
              {/* Drop-off */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Drop-off
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {activeDelivery.dropoff}
                  </p>
                </div>
              </div>
            </div>

            {/* Distance / ETA Pills */}
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Route className="w-3 h-3" />
                {activeDelivery.distance}
              </span>
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                ETA {activeDelivery.eta}
              </span>
            </div>

            {/* Navigate CTA */}
            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              <Navigation className="w-4 h-4" />
              Navigate to Drop-off
            </button>
          </div>
        </div>
      </section>

      {/* ── Pending Queue ── */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Up Next ({pendingOrders.length})
        </h2>
        <div className="space-y-3">
          {pendingOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {order.id}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {order.customer} • {order.items} items
                  </p>
                </div>
                <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {order.due}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2 mb-3 border border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    {order.dropoff}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {order.distance} away • ~{order.eta}
                  </p>
                </div>
              </div>

              <button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
                Accept
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Deliveries (Collapsible) ── */}
      <section>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3"
        >
          <span>Recent Deliveries</span>
          {showHistory ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showHistory && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
            {recentDeliveries.map((d) => (
              <div
                key={d.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {d.customer} • {d.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {d.rating}
                  </span>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {d.status}
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
