import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { sendPushNotificationBatch, isVapidConfigured } from "@/lib/push/server";
import { PushSubscription } from "web-push";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function processPredictiveReordering() {
    if (!isVapidConfigured()) {
        console.warn("VAPID not configured. Skipping predictive reordering push notifications.");
        return { success: false, error: "Push not configured" };
    }

    const supabase = await createClient();

    // 1. Fetch all delivered orders with items
    const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
      id,
      user_id,
      created_at,
      order_items (
        product_id,
        product_snapshot
      )
    `)
        .eq("status", "delivered")
        .order("created_at", { ascending: true });

    if (ordersError || !orders) {
        console.error("Failed to fetch orders for predictive reordering:", ordersError);
        return { success: false, error: "Failed to fetch orders" };
    }

    // 2. Group by user and product to find purchase intervals
    // user_id -> product_id -> purchase dates
    const userPurchases: Record<string, Record<string, { dates: Date[], name: string }>> = {};

    for (const order of orders) {
        if (!order.user_id) continue;

        if (!userPurchases[order.user_id]) {
            userPurchases[order.user_id] = {};
        }

        const orderDate = new Date(order.created_at || new Date().toISOString());

        // Cast order_items since Supabase typings might be imprecise
        const items = (order.order_items || []) as any[];

        for (const item of items) {
            if (!item.product_id) continue;
            const pId: string = item.product_id;
            if (!userPurchases[order.user_id][pId]) {
                userPurchases[order.user_id][pId] = {
                    dates: [],
                    name: item.product_snapshot?.name || "Product"
                };
            }
            userPurchases[order.user_id][pId].dates.push(orderDate);
        }
    }

    const today = new Date();
    let notificationsSent = 0;

    // 3. Calculate intervals and identify due items
    for (const [userId, products] of Object.entries(userPurchases)) {
        const dueItems: string[] = [];

        for (const [productId, data] of Object.entries(products)) {
            if (data.dates.length < 2) continue; // Need at least 2 purchases to calculate an interval

            // Calculate average interval in days
            let totalDays = 0;
            for (let i = 1; i < data.dates.length; i++) {
                const diffTime = Math.abs(data.dates[i].getTime() - data.dates[i - 1].getTime());
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                totalDays += diffDays;
            }
            const avgInterval = totalDays / (data.dates.length - 1);

            const lastPurchase = data.dates[data.dates.length - 1];
            const daysSinceLastPurchase = Math.abs(today.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);

            // If currently due (e.g., within 1 day of the expected reorder time or slightly past)
            // We add some buffer, say if it's been more than (avgInterval - 2) days
            if (daysSinceLastPurchase >= (avgInterval - 2) && daysSinceLastPurchase <= (avgInterval + 5)) {
                dueItems.push(data.name);
            }
        }

        if (dueItems.length > 0) {
            // 4. Check if user has active push subscriptions before generating LLM text
            const { data: subs } = await supabase
                .from("push_subscriptions")
                .select("endpoint, p256dh, auth")
                .eq("user_id", userId)
                .eq("is_active", true);

            if (!subs || subs.length === 0) continue;

            // 5. Generate personalized message using LLM
            // Limit list to avoid huge prompts
            const itemsList = dueItems.slice(0, 5).join(", ");
            const extraCount = dueItems.length > 5 ? ` and ${dueItems.length - 5} more items` : "";

            try {
                const { text } = await generateText({
                    model: openrouter("openai/gpt-4o-mini"),
                    system: "You are a helpful and friendly AI shopping assistant for Fresh Mart. Keep your responses very short (maximum 2 sentences, under 100 characters). You must sound cheerful and colloquial.",
                    prompt: `The user usually buys these items and might be running out soon: ${itemsList}${extraCount}. Write a short, friendly push notification message (body only, no title) reminding them to restock. Do not wrap in quotes. Keep it very brief!`,
                });

                const notificationMsg = text.trim();

                const pushSubscriptions: PushSubscription[] = subs.map((s) => ({
                    endpoint: s.endpoint,
                    keys: {
                        p256dh: s.p256dh,
                        auth: s.auth,
                    },
                }));

                await sendPushNotificationBatch(pushSubscriptions, {
                    title: "Time to Restock? 🛒",
                    body: notificationMsg,
                    tag: `reorder-${userId}-${Date.now()}`,
                    url: "/shop", // Take them to shop
                    requireInteraction: true,
                });

                notificationsSent++;
            } catch (e) {
                console.error(`Failed to generate or send reorder notification for user ${userId}:`, e);
            }
        }
    }

    return { success: true, notificationsSent };
}
