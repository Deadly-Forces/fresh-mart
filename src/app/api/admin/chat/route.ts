// @ts-nocheck
import { openrouter, defaultModel } from "@/lib/openrouter";
import { streamText, tool, convertToModelMessages } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

// Models tried in order — better models for multi-step tool calling
const ADMIN_CHAT_MODELS = [
    process.env.OPENROUTER_MODEL,
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-3-4b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
].filter(Boolean) as string[];

const ADMIN_SYSTEM = `You are **FreshMart Admin AI** — an intelligent business intelligence assistant embedded inside the FreshMart admin dashboard.

You have access to live store data through tools. Use them proactively to answer data questions.

## ADMIN PORTAL SECTIONS YOU KNOW ABOUT
- **Dashboard** — Overview of business KPIs (orders today, revenue, new customers)
- **Products** — Add, edit, delete, activate/deactivate products and manage stock
- **Categories** — Manage product categories and subcategories
- **Orders** — View, update status, cancel, and manage all customer orders
- **Returns** — Handle product return requests from customers
- **Picker** — Manage warehouse pickers who fulfil orders
- **Rider** — Manage delivery riders and assign deliveries
- **Notifications** — Send push notifications to customers
- **Loyalty** — Manage loyalty points, tiers, and redemption rules
- **Referrals** — View referral usage and rewards
- **Reviews** — Moderate customer product reviews
- **Users** — View customer accounts and their order history
- **Coupons** — Create and manage discount codes
- **Banners** — Manage homepage promotional banners
- **Wishlists** — View what customers are saving
- **Analytics** — Sales charts, revenue trends, category breakdowns

## RULES
1. You ONLY assist with admin/business tasks. Refuse customer-facing queries (recipe help, personal shopping advice, etc.)
2. After EVERY tool call, you MUST write a clear summary of the results. Never leave a tool result without a follow-up text.
3. Use Markdown tables and bullet lists for data. Be concise and professional.
4. Use ₹ for currency. Dates in DD/MM/YYYY format.
5. If you cannot perform an action (like actually editing a product — just provide guidance on which admin page to visit.`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const supabase = await createClient();

        const adminTools = {
            // ── Orders ─────────────────────────────────────
            getRecentOrders: tool({
                description: "Fetch the most recent orders with status, total, and date.",
                parameters: z.object({
                    limit: z.number().optional().describe("Number of orders to return, default 10"),
                    status: z.string().optional().describe("Filter by order status: pending, confirmed, packed, shipping, delivered, cancelled"),
                }),
                execute: async ({ limit = 10, status }) => {
                    let query = supabase
                        .from("orders")
                        .select("id, status, total, created_at, payment_status, payment_method")
                        .order("created_at", { ascending: false })
                        .limit(limit);
                    if (status) query = query.eq("status", status);
                    const { data } = await query;
                    return data || [];
                },
            }),

            getOrderStats: tool({
                description: "Get revenue, order count, and avg order value for N days (default 30).",
                parameters: z.object({
                    days: z.number().optional().describe("Number of days to look back, default 30"),
                }),
                execute: async ({ days = 30 }) => {
                    const since = new Date();
                    since.setDate(since.getDate() - days);
                    const { data } = await supabase
                        .from("orders")
                        .select("total, status, created_at")
                        .gte("created_at", since.toISOString());

                    if (!data) return { revenue: 0, count: 0, avgOrderValue: 0, cancelledCount: 0 };
                    const completed = data.filter(o => o.status !== "cancelled");
                    const revenue = completed.reduce((sum, o) => sum + Number(o.total), 0);
                    const today = data.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
                    return {
                        periodDays: days,
                        totalRevenue: `₹${revenue.toFixed(2)}`,
                        orderCount: completed.length,
                        avgOrderValue: completed.length > 0 ? `₹${(revenue / completed.length).toFixed(2)}` : "₹0",
                        cancelledCount: data.length - completed.length,
                        todayOrders: today.length,
                    };
                },
            }),

            updateOrderStatus: tool({
                description: "Update the status of a specific order by its ID.",
                parameters: z.object({
                    orderId: z.string().describe("The full order UUID"),
                    status: z.enum(["confirmed", "packed", "shipping", "delivered", "cancelled"]).describe("New status to set"),
                }),
                execute: async ({ orderId, status }) => {
                    const { error } = await supabase
                        .from("orders")
                        .update({ status })
                        .eq("id", orderId);
                    if (error) return { success: false, error: error.message };
                    return { success: true, message: `Order ${orderId.slice(0, 8).toUpperCase()} updated to "${status}"` };
                },
            }),

            // ── Products & Inventory ─────────────────────
            getInventoryStatus: tool({
                description: "Get products with low or zero stock.",
                parameters: z.object({
                    threshold: z.number().optional().describe("Stock threshold to consider 'low', default 10"),
                }),
                execute: async ({ threshold = 10 }) => {
                    const { data } = await supabase
                        .from("products")
                        .select("name, stock, unit, price, is_active")
                        .lte("stock", threshold)
                        .order("stock", { ascending: true })
                        .limit(25);
                    return data || [];
                },
            }),

            getTopProducts: tool({
                description: "Get the top-selling products ranked by quantity sold.",
                parameters: z.object({
                    limit: z.number().optional().describe("How many top products to return, default 10"),
                }),
                execute: async ({ limit = 10 }) => {
                    const { data } = await supabase
                        .from("order_items")
                        .select("product_name, quantity")
                        .limit(500);
                    if (!data) return [];
                    const agg: Record<string, number> = {};
                    for (const item of data) {
                        agg[item.product_name] = (agg[item.product_name] || 0) + item.quantity;
                    }
                    return Object.entries(agg)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, limit)
                        .map(([name, totalSold], i) => ({ rank: i + 1, name, totalSold }));
                },
            }),

            searchProducts: tool({
                description: "Search for products by name. Useful for checking stock of a specific item.",
                parameters: z.object({
                    query: z.string().describe("Product name or keyword to search"),
                }),
                execute: async ({ query }) => {
                    const { data } = await supabase
                        .from("products")
                        .select("id, name, price, stock, unit, is_active, category")
                        .ilike("name", `%${query}%`)
                        .limit(10);
                    return data || [];
                },
            }),

            // ── Customers ────────────────────────────────
            getCustomerStats: tool({
                description: "Get total customer count and new signups in the last N days.",
                parameters: z.object({
                    days: z.number().optional().describe("Days to look back for new signups, default 30"),
                }),
                execute: async ({ days = 30 }) => {
                    const since = new Date();
                    since.setDate(since.getDate() - days);
                    const { count: total } = await supabase
                        .from("profiles")
                        .select("id", { count: "exact", head: true });
                    const { count: newUsers } = await supabase
                        .from("profiles")
                        .select("id", { count: "exact", head: true })
                        .gte("created_at", since.toISOString());
                    return { totalCustomers: total ?? 0, newInLast30Days: newUsers ?? 0 };
                },
            }),

            // ── Coupons ──────────────────────────────────
            getActiveCoupons: tool({
                description: "List all active discount coupons.",
                parameters: z.object({}),
                execute: async () => {
                    const { data } = await supabase
                        .from("coupons")
                        .select("code, discount_type, discount_value, min_order, uses_count, max_uses, expires_at, is_active")
                        .eq("is_active", true)
                        .order("created_at", { ascending: false })
                        .limit(20);
                    return data || [];
                },
            }),

            // ── Returns ──────────────────────────────────
            getRecentReturns: tool({
                description: "Get recent return requests and their status.",
                parameters: z.object({
                    limit: z.number().optional().describe("Number of returns to fetch, default 10"),
                }),
                execute: async ({ limit = 10 }) => {
                    const { data } = await supabase
                        .from("returns")
                        .select("id, reason, status, created_at, order_id")
                        .order("created_at", { ascending: false })
                        .limit(limit);
                    return data || [];
                },
            }),

            // ── Reviews ──────────────────────────────────
            getPendingReviews: tool({
                description: "Get unmoderated or pending product reviews.",
                parameters: z.object({}),
                execute: async () => {
                    const { data } = await supabase
                        .from("reviews")
                        .select("id, product_id, rating, comment, created_at, is_approved")
                        .eq("is_approved", false)
                        .order("created_at", { ascending: false })
                        .limit(15);
                    return data || [];
                },
            }),
        };

        const modelMessages = await convertToModelMessages(messages);

        for (const modelId of ADMIN_CHAT_MODELS) {
            try {
                const result = streamText({
                    model: openrouter(modelId),
                    system: ADMIN_SYSTEM,
                    messages: modelMessages,
                    tools: adminTools,
                    maxSteps: 5,
                    maxOutputTokens: 800,
                });
                return result.toUIMessageStreamResponse();
            } catch (err: any) {
                const status = err?.statusCode ?? err?.status ?? 0;
                if (status !== 429 && status !== 404 && status < 500) throw err;
                console.warn(`Admin chat model ${modelId} failed (${status}), trying next...`);
            }
        }

        return new Response("All AI models are currently unavailable. Please try again shortly.", { status: 503 });
    } catch (error) {
        console.error("Admin Chat API Error:", error);
        return new Response("An error occurred", { status: 500 });
    }
}
