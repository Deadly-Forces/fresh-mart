// @ts-nocheck
import { openrouter, defaultModel } from "@/lib/openrouter";
import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const supabase = await createClient();

        const result = streamText({
            model: openrouter(defaultModel),
            system: `You are FreshMart Admin AI — an intelligent assistant embedded inside the FreshMart admin dashboard.
You help store administrators manage their grocery e-commerce business by answering business questions and providing data-driven insights.

You have access to tools that let you query live store data:
- Use 'getRecentOrders' to show recent orders, revenue, and order statuses.
- Use 'getInventoryStatus' to show low/out-of-stock products.
- Use 'getTopProducts' to show best-selling products.
- Use 'getOrderStats' to get revenue and order count summary.

IMPORTANT RULES:
1. You operate ONLY in an admin context — do NOT answer customer-facing queries (e.g. recipe help).
2. Be concise, data-driven, and professional. Use tables/lists in Markdown when displaying data.
3. Always use tools to fetch live data instead of making assumptions.
4. If asked about something outside your scope (orders, inventory, products, revenue), politely decline.`,
            messages: await convertToModelMessages(messages),
            tools: {
                getRecentOrders: tool({
                    description: "Fetch the most recent orders with their status, total, and customer info.",
                    parameters: z.object({
                        limit: z.number().optional().describe("Number of orders to return, default 10"),
                    }),
                    // @ts-ignore
                    execute: async ({ limit = 10 }) => {
                        const { data } = await supabase
                            .from("orders")
                            .select("id, status, total, created_at, user_id")
                            .order("created_at", { ascending: false })
                            .limit(limit);
                        return data || [];
                    },
                }),
                getInventoryStatus: tool({
                    description: "Get products with low stock or out of stock.",
                    parameters: z.object({
                        threshold: z.number().optional().describe("Stock threshold to consider 'low', default 10"),
                    }),
                    // @ts-ignore
                    execute: async ({ threshold = 10 }) => {
                        const { data } = await supabase
                            .from("products")
                            .select("name, stock, unit, price")
                            .lte("stock", threshold)
                            .eq("is_active", true)
                            .order("stock", { ascending: true })
                            .limit(20);
                        return data || [];
                    },
                }),
                getTopProducts: tool({
                    description: "Get the top-selling products based on order items.",
                    parameters: z.object({}),
                    // @ts-ignore
                    execute: async () => {
                        const { data } = await supabase
                            .from("order_items")
                            .select("product_name, quantity")
                            .limit(100);

                        if (!data) return [];

                        // Aggregate by product name
                        const agg: Record<string, number> = {};
                        for (const item of data) {
                            agg[item.product_name] = (agg[item.product_name] || 0) + item.quantity;
                        }
                        return Object.entries(agg)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([name, totalSold]) => ({ name, totalSold }));
                    },
                }),
                getOrderStats: tool({
                    description: "Get total revenue, order count, and average order value for the last 30 days.",
                    parameters: z.object({}),
                    // @ts-ignore
                    execute: async () => {
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                        const { data } = await supabase
                            .from("orders")
                            .select("total, status")
                            .gte("created_at", thirtyDaysAgo.toISOString());

                        if (!data) return { revenue: 0, count: 0, avgOrderValue: 0 };

                        const completed = data.filter((o) => o.status !== "cancelled");
                        const revenue = completed.reduce((sum, o) => sum + Number(o.total), 0);
                        return {
                            revenue: revenue.toFixed(2),
                            count: completed.length,
                            avgOrderValue: completed.length > 0 ? (revenue / completed.length).toFixed(2) : "0",
                            cancelledCount: data.length - completed.length,
                        };
                    },
                }),
            },
            maxSteps: 3,
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Admin Chat API Error:", error);
        return new Response("An error occurred", { status: 500 });
    }
}
