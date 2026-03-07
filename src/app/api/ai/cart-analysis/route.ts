import { openrouter, defaultModel } from "@/lib/openrouter";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response("Cart is empty", { status: 400 });
    }

    const cartSummary = items
      .map((i: any) => `${i.quantity}x ${i.product?.name || "Unknown"}`)
      .join(", ");

    const { object } = await generateObject({
      model: openrouter(defaultModel),
      schema: z.object({
        insight: z
          .string()
          .describe(
            "A short, friendly, and practical healthy tip or suggestion based on the cart contents (max 2 sentences).",
          ),
        type: z
          .enum(["positive", "suggestion", "warning"])
          .describe("The tone of the insight."),
      }),
      prompt: `The user has the following items in their grocery cart:
${cartSummary}

Analyze this cart briefly. Provide a very short, friendly dietary insight. 
For example, if they have lots of pasta, maybe playfully suggest adding some fresh spinach. If it's a very balanced cart, give them a compliment.
Keep it extremely concise (1-2 sentences max) and conversational!`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Error generating cart analysis:", error);
    return new Response("Failed to generate cart analysis", { status: 500 });
  }
}
