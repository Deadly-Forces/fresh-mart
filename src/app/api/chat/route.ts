import { openrouter } from "@/lib/openrouter";
import { streamText, convertToModelMessages } from "ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// Models ordered by reliability — tried in sequence until streaming starts
const CHAT_MODELS = [
    process.env.OPENROUTER_MODEL,
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-3-4b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
].filter(Boolean) as string[];

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const supabase = await createClient();

        // ── Pre-fetch context so we only need ONE LLM call (no tool round-trips) ──
        const lastUserText = [...messages]
            .reverse()
            .find((m: any) => m.role === "user")
            ?.parts?.find((p: any) => p.type === "text")?.text as string ?? "";

        const lower = lastUserText.toLowerCase();

        // 1. Order context — fetch if user is asking about orders
        let orderContext = "";
        if (/order|purchase|bought|delivery|status|track/i.test(lower)) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: orders } = await supabase
                    .from("orders")
                    .select("id, status, total, created_at, payment_status")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (orders?.length) {
                    orderContext = `\n\nUSER'S RECENT ORDERS:\n` +
                        orders.map(o =>
                            `- Order #${o.id.slice(0, 8).toUpperCase()} | Status: ${o.status} | ₹${o.total} | Date: ${o.created_at ? new Date(o.created_at).toLocaleDateString() : "unknown"}`
                        ).join("\n");
                } else {
                    orderContext = "\n\nThe user has no recent orders.";
                }
            } else {
                orderContext = "\n\nThe user is not logged in, so order data is unavailable. Politely ask them to sign in.";
            }
        }

        // 2. Product context — search if user is asking about a product
        let productContext = "";
        // Extract meaningful words (skip filler words)
        const searchTerms = lower
            .replace(/can you|please|find|search|do you have|show me|i want|i need|what about|looking for/g, "")
            .trim();
        if (searchTerms && !/order|status|track|purchase|delivery/i.test(lower)) {
            const keyword = searchTerms.split(/\s+/).slice(0, 3).join(" ").trim();
            if (keyword.length > 2) {
                const { data: products } = await supabase
                    .from("products")
                    .select("name, price, stock, unit")
                    .ilike("name", `%${keyword}%`)
                    .eq("is_active", true)
                    .limit(8);

                if (products?.length) {
                    productContext = `\n\nRELEVANT PRODUCTS IN STORE:\n` +
                        products.map(p =>
                            `- ${p.name} — ₹${p.price}/${p.unit}, Stock: ${(p.stock ?? 0) > 0 ? "available" : "out of stock"}`
                        ).join("\n");
                }
            }
        }

        const systemPrompt = `You are the Fresh Mart AI Concierge — a friendly, helpful assistant for a grocery delivery app.
You help customers find products, get recipe ideas, and check their order status.
Always respond in 2–4 concise sentences. Be warm and conversational. Use ₹ for prices.
If the user asks about an order and you have order data below, answer directly from it.
If the user asks about a product and you have product data below, mention it naturally.
Do NOT ask the user for information you already have below.${orderContext}${productContext}`;

        const modelMessages = await convertToModelMessages(messages);

        // Try each model until one starts streaming
        for (const modelId of CHAT_MODELS) {
            try {
                const result = streamText({
                    model: openrouter(modelId),
                    system: systemPrompt,
                    messages: modelMessages,
                    maxOutputTokens: 400,
                });
                return result.toUIMessageStreamResponse();
            } catch (err: any) {
                const status = err?.statusCode ?? err?.status ?? 0;
                if (status !== 429 && status !== 404 && status < 500) throw err;
                console.warn(`Chat model ${modelId} failed (${status}), trying next...`);
            }
        }

        return new Response("All AI models are currently unavailable. Please try again shortly.", { status: 503 });
    } catch (error) {
        console.error("Chat API Error:", error);
        return new Response("An error occurred", { status: 500 });
    }
}
