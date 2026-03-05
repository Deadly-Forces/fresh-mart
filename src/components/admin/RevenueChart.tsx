"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type ChartDataPoint = {
    label: string;
    revenue: number;
    orders: number;
};

type RevenueChartProps = {
    dailyData: ChartDataPoint[];
    weeklyData: ChartDataPoint[];
    monthlyData: ChartDataPoint[];
};

type Period = "Daily" | "Weekly" | "Monthly";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: any[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-sm font-bold text-primary">
                {currencyFormatter.format(payload[0].value)}
            </p>
            {payload[1] && (
                <p className="text-xs text-muted-foreground mt-0.5">
                    {payload[1].value} order{payload[1].value !== 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
}

export function RevenueChart({
    dailyData,
    weeklyData,
    monthlyData,
}: RevenueChartProps) {
    const [activePeriod, setActivePeriod] = useState<Period>("Weekly");

    const dataMap: Record<Period, ChartDataPoint[]> = {
        Daily: dailyData,
        Weekly: weeklyData,
        Monthly: monthlyData,
    };

    const data = dataMap[activePeriod];

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
    const yAxisMax = maxRevenue > 0 ? undefined : 1000;

    return (
        <div className="bg-card border border-border rounded-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-lg">Revenue Overview</h3>
                <div className="flex gap-1">
                    {(["Daily", "Weekly", "Monthly"] as Period[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActivePeriod(tab)}
                            className={`px-3 py-1 rounded-button text-xs font-medium transition-colors ${activePeriod === tab
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[280px]">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No revenue data available for this period.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <AreaChart
                            data={data}
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="0%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={{ stroke: "hsl(var(--border))" }}
                                tickLine={false}
                                dy={8}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) =>
                                    v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                                }
                                domain={yAxisMax ? [0, yAxisMax] : undefined}
                                width={55}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2.5}
                                fill="url(#revenueGrad)"
                                dot={false}
                                activeDot={{
                                    r: 5,
                                    fill: "hsl(var(--primary))",
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
