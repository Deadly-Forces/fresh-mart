import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function analyzeOrderFraud(orderId: string) {
    const supabase = await createClient();

    // 1. Fetch the target order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`
      *,
      order_items (
        product_id,
        quantity,
        price,
        product_snapshot
      )
    `)
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
        console.error("Order not found or error:", orderError);
        return { success: false, error: "Order not found" };
    }

    // 2. Fetch the user profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", order.user_id)
        .single();

    // 3. Fetch past orders for the user
    const { data: pastOrders } = await supabase
        .from("orders")
        .select("id, total, created_at, status")
        .eq("user_id", order.user_id)
        .neq("id", orderId)
        .order("created_at", { ascending: false });

    // 4. Calculate user metrics needed for fraud analysis
    const totalPastOrders = pastOrders?.length || 0;
    const averagePastValue = totalPastOrders > 0
        ? pastOrders!.reduce((sum, o) => sum + Number(o.total), 0) / totalPastOrders
        : 0;
    const timeSinceRegistration = profile?.created_at
        ? (new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
        : 0;

    const analysisPayload = {
        current_order: {
            id: order.id,
            total_amount: order.total,
            item_count: order.order_items?.length || 0,
            items: order.order_items?.map((item: any) => ({
                name: item.product_snapshot?.name || "Unknown Product",
                quantity: item.quantity,
                price: item.price
            })),
            created_at: order.created_at,
            payment_method: order.payment_method
        },
        user_context: {
            account_age_days: Number(timeSinceRegistration.toFixed(1)),
            total_past_orders: totalPastOrders,
            average_past_order_value: Number(averagePastValue.toFixed(2)),
            is_onboarded: profile?.is_onboarded
        }
    };

    // 5. Generate Fraud Score using LLM
    try {
        const { object } = await generateObject({
            model: openrouter(process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini"),
            schema: z.object({
                fraud_score: z.number().min(0).max(100).describe("0 = Safe, 100 = Definitive Fraud"),
                is_fraudulent: z.boolean(),
                risk_factors: z.array(z.string()).describe("List of suspicious observations, if any."),
                recommendation: z.enum(["approve", "manual_review", "reject"]).describe("Recommended action for admins.")
            }),
            messages: [
                {
                    role: "system",
                    content: `You are an AI Fraud Detection system for Fresh Mart, an online grocery delivery startup. 
Analyze order details and user history to determine fraud likelihood.
Key markers for grocery fraud:
- Extremely high order totals combined with brand new accounts (0 past orders).
- Orders heavily skewed towards high-value items (expensive cheese, premium meats) with massive quantities.
- A sudden massive order (e.g., ₹10,000) when past orders average ₹500.
Return a fraud score between 0 and 100.`
                },
                {
                    role: "user",
                    content: `Analyze this order and user context:\n${JSON.stringify(analysisPayload, null, 2)}`
                }
            ]
        });

        // Optionally: If it's flagged, we could update the order status to "flagged_for_review"
        if (object.recommendation === "manual_review" || object.recommendation === "reject") {
            await supabase
                .from("orders")
                .update({ status: object.recommendation === "reject" ? "cancelled" : "manual_review" })
                .eq("id", orderId);
            console.log(`[Fraud Detection] Order ${orderId} marked as ${object.recommendation}`);
        }

        return {
            success: true,
            order_id: orderId,
            analysis: object
        };
    } catch (error) {
        console.error("LLM Fraud Analysis failed:", error);
        return { success: false, error: "Failed to analyze fraud score" };
    }
}
