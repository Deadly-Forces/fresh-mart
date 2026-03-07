import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { sendPushNotificationBatch, isVapidConfigured } from "@/lib/push/server";
import { PushSubscription } from "web-push";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function processWinbackCampaign() {
    if (!isVapidConfigured()) {
        console.warn("VAPID not configured. Skipping winback campaigns via push.");
        return { success: false, error: "Push not configured" };
    }

    const supabase = await createClient();

    // 1. Identify "At Risk" customers.
    // We'll define "At Risk" as users who have ordered before, but haven't ordered in the last 30 days.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Find users' latest order date
    const { data: latestOrders, error: latestError } = await supabase
        .from("orders")
        .select("user_id, created_at")
        // Note: in a massive DB, this query should be optimized. We'll group them in code for simplicity here.
        .order("created_at", { ascending: false });

    if (latestError || !latestOrders) {
        console.error("Failed to fetch orders for winback campaign:", latestError);
        return { success: false, error: "Failed to fetch orders" };
    }

    const lastOrderDateByUser: Record<string, Date> = {};
    for (const order of latestOrders) {
        if (!order.user_id || !order.created_at) continue;

        const orderDate = new Date(order.created_at);
        if (!lastOrderDateByUser[order.user_id]) {
            lastOrderDateByUser[order.user_id] = orderDate;
        } else {
            if (orderDate > lastOrderDateByUser[order.user_id]) {
                lastOrderDateByUser[order.user_id] = orderDate;
            }
        }
    }

    const today = new Date();
    const atRiskUserIds: string[] = [];

    for (const [userId, lastDate] of Object.entries(lastOrderDateByUser)) {
        const daysSinceLastOrder = Math.floor(Math.abs(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        // Target customers who haven't bought in 30 to 45 days (to avoid spamming them forever)
        if (daysSinceLastOrder >= 30 && daysSinceLastOrder <= 45) {
            atRiskUserIds.push(userId);
        }
    }

    if (atRiskUserIds.length === 0) {
        return { success: true, messagesSent: 0, note: "No at-risk users found in the targeted window." };
    }

    let messagesSent = 0;

    // 2. Process each at-risk user
    for (const userId of atRiskUserIds) {
        // Collect active push subscriptions for this user
        const { data: subs } = await supabase
            .from("push_subscriptions")
            .select("endpoint, p256dh, auth")
            .eq("user_id", userId)
            .eq("is_active", true);

        if (!subs || subs.length === 0) continue;

        // Fetch user profile for name 
        const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", userId)
            .single();

        const userName = profile?.name || "there";

        try {
            // 3. Generate a single-use discount coupon
            const discountPercentage = 15; // Give them 15% off to return
            const code = `WINBACK${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const { error: couponError } = await supabase.from("coupons").insert({
                code,
                type: "percentage",
                value: discountPercentage,
                is_active: true,
                max_uses: 1, // Single use
                per_user_limit: 1,
                description: `Win-back 15% discount for ${userName}`,
            });

            if (couponError) {
                console.error(`Failed to generate coupon for user ${userId}:`, couponError);
                continue;
            }

            // 4. Generate AI personalized push notification message
            const { text } = await generateText({
                model: openrouter("openai/gpt-4o-mini"),
                system: "You are a friendly, welcoming AI shopping assistant at Fresh Mart writing short push notifications.",
                prompt: `Write a short, colloquial push notification (body text only, max 80 characters, no quotes) for our customer ${userName} who hasn't shopped with us in a while. Tell them we miss them and that they can use the code ${code} for 15% off their next order. Be sweet and brief.`,
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
                title: "We Miss You! 💚",
                body: notificationMsg,
                tag: `winback-${userId}-${Date.now()}`,
                url: "/shop",
                requireInteraction: true,
            });

            messagesSent++;
        } catch (e) {
            console.error(`Failed to process winback campaign for user ${userId}:`, e);
        }
    }

    return { success: true, messagesSent };
}
