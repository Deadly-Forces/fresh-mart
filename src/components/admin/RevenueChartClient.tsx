"use client";

import dynamic from "next/dynamic";

export const RevenueChartClient = dynamic(
  () => import("./RevenueChart").then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card border border-border rounded-card p-6 shadow-sm h-[390px] flex items-center justify-center text-muted-foreground text-sm">
        Loading chart...
      </div>
    ),
  },
);
