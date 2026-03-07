import { openrouter, defaultModel } from "@/lib/openrouter";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { productName, category } = await req.json();

    if (!productName) {
      return new Response("Product name is required", { status: 400 });
    }

    const { object } = await generateObject({
      model: openrouter(defaultModel),
      schema: z.object({
        alternatives: z
          .array(
            z.object({
              name: z.string().describe("The name of the alternative product"),
              reason: z
                .string()
                .describe("A short reason why this is a good substitute"),
            }),
          )
          .max(3)
          .describe("A list of up to 3 alternative grocery products."),
      }),
      prompt: `The grocery store item "${productName}" (Category: ${category || "Unknown"}) is currently out of stock. 
Please suggest up to 3 common grocery store alternatives that a customer might accept instead. 
Keep the reasons very brief and practical.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Error generating replacements:", error);
    return new Response("Failed to generate alternatives", { status: 500 });
  }
}
