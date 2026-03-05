"use client";

import dynamic from "next/dynamic";

// Define the exact same props interface so the parent component doesn't need to change
export type ChartDataPoint = {
    label: string;
    revenue: number;
    orders: number;
};

export type RevenueChartProps = {
    dailyData: ChartDataPoint[];
    weeklyData: ChartDataPoint[];
    monthlyData: ChartDataPoint[];
};

// Dynamically import the actual chart content, disabling SSR to prevent Recharts hydration issues.
const RevenueChartContent = dynamic(
    () => import("./RevenueChartContent").then((mod) => mod.RevenueChartContent),
    {
        ssr: false,
        loading: () => (
            <div className="bg-card border border-border rounded-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading text-lg">Revenue Overview</h3>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 rounded-button text-xs font-medium bg-primary text-primary-foreground">
                            Loading...
                        </button>
                    </div>
                </div>
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    Loading chart...
                </div>
            </div>
        )
    }
);

export function RevenueChart(props: RevenueChartProps) {
    return <RevenueChartContent {...props} />;
}
