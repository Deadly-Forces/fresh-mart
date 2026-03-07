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
            system: `You are the Fresh Mart AI Concierge.
You help customers find products, suggest recipes to cook, and check their order status.
When suggesting items, ALWAYS use the 'searchProducts' tool first to ensure the items are in stock and to fetch their exact names and prices.
Keep your responses very concise, friendly, and helpful.`,
            messages: await convertToModelMessages(messages),
            tools: {
                searchProducts: tool({
                    description:
                        "Search the store for grocery products by name or keyword.",
                    parameters: z.object({
                        query: z
                            .string()
                            .describe(
                                "The product name to search for (e.g. 'tomato', 'milk'). Use single obvious keywords for best results.",
                            ),
                    }),
                    // @ts-ignore
                    execute: async ({ query }) => {
                        const { data } = await supabase
                            .from("products")
                            .select("name, price, stock, unit")
                            .ilike("name", `%${query}%`)
                            .eq("is_active", true)
                            .limit(5);
                        return data || [];
                    },
                }),
                checkOrderStatus: tool({
                    description: "Check the status of a user's recent orders.",
                    parameters: z.object({}),
                    // @ts-ignore
                    execute: async () => {
                        const {
                            data: { user },
                        } = await supabase.auth.getUser();
                        if (!user) return { error: "User is not logged in." };

                        const { data: orders } = await supabase
                            .from("orders")
                            .select("id, status, total, created_at")
                            .eq("user_id", user.id)
                            .order("created_at", { ascending: false })
                            .limit(3);

                        return orders || [];
                    },
                }),
            },
            maxSteps: 3,
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Chat API Error:", error);
        return new Response("An error occurred", { status: 500 });
    }
}
