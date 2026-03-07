import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { message, userId, orderId } = await req.json();

        if (!message || !userId) {
            return NextResponse.json({ error: "message and userId are required" }, { status: 400 });
        }

        const supabase = await createClient();

        // Optionally fetch order details if orderId is provided to give LLM more context
        let orderContext = null;
        if (orderId) {
            const { data: order } = await supabase
                .from("orders")
                .select(`
          id, status, total, created_at,
          order_items ( product_snapshot )
        `)
                .eq("id", orderId)
                .single();
            if (order) orderContext = order;
        }

        const { object } = await generateObject({
            model: openrouter(process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini"),
            schema: z.object({
                category: z.enum(["where_is_my_order", "missing_item", "quality_issue", "refund_request", "general_inquiry", "other"]),
                priority: z.enum(["low", "medium", "urgent"]).describe("Quality issues with perishables or missing entire orders are urgent."),
                summary: z.string().describe("1 sentence summary of the customer's problem."),
                suggested_action: z.enum(["auto_reply", "escalate_to_human", "auto_refund"]).describe("What should the system do next?"),
                draft_response: z.string().describe("A polite, empathetic draft response to the customer.")
            }),
            messages: [
                {
                    role: "system",
                    content: "You are an AI Support Triage Agent for Fresh Mart. You categorize incoming customer support messages, determine priority, and draft responses. Fresh Mart prioritizes speedy resolution for spoiled or missing groceries."
                },
                {
                    role: "user",
                    content: `Customer Message: "${message}"\nOrder Context: ${orderContext ? JSON.stringify(orderContext) : "None"}`
                }
            ]
        });

        // Optionally: save this to a `support_tickets` table if it exists.
        // For now, return the triage result to the frontend or integration.

        return NextResponse.json({ success: true, triage: object });
    } catch (error) {
        console.error("Support Triage Error:", error);
        return NextResponse.json({ error: "Failed to triage support message" }, { status: 500 });
    }
}
