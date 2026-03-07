import { openrouter } from "@/lib/openrouter";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return new Response("Image is required", { status: 400 });
        }

        // Must explicitly type base64 data to pass to specific models if needed, 
        // Vercel AI SDK handles `data:image/jpeg;base64,...` format well.

        const { object } = await generateObject({
            // Use a specific vision model from OpenRouter like gpt-4o-mini
            model: openrouter(process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini"),
            schema: z.object({
                products: z.array(z.string()).describe("List of generic grocery product names extracted from the image."),
            }),
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Identify the grocery items, food ingredients, or the dish shown in this image. Extract them as a list of simple, generic grocery product names (e.g. 'tomatoes', 'pasta', 'milk'). Limit to 10 items." },
                        { type: "image", image: image }, // Pass the base64 URL directly
                    ],
                },
            ],
        });

        return Response.json(object);
    } catch (error) {
        console.error("Error analyzing image:", error);
        return new Response("Failed to analyze image", { status: 500 });
    }
}
