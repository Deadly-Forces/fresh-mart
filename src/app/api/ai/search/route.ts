import { openrouter, defaultModel } from "@/lib/openrouter";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return new Response("Query is required", { status: 400 });
    }

    const { object } = await generateObject({
      model: openrouter(defaultModel),
      schema: z.object({
        products: z
          .array(z.string())
          .describe(
            "List of generic grocery product names extracted from the query.",
          ),
        isRecipe: z
          .boolean()
          .describe(
            "True if the user's query sounds like they are asking to cook a dish or recipe, false otherwise.",
          ),
      }),
      prompt: `The user wants to shop for groceries based on this query: "${query}"
If they are asking for a recipe, extract the core ingredients and return them as generic grocery product names (e.g. "tomatoes", "onions", "chicken breast").
If they are just searching for something vaguely, try to translate it into specific product search terms. Returns at most 10 items.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Error generating search terms:", error);
    return new Response("Failed to generate search terms", { status: 500 });
  }
}
