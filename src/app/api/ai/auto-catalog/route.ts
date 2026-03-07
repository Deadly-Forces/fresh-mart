import { openrouter } from "@/lib/openrouter";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { image, categories } = await req.json();

        if (!image) {
            return new Response("Image is required", { status: 400 });
        }

        const categoriesContext = Array.isArray(categories)
            ? categories.map((c: any) => `{id: "${c.id}", name: "${c.name}"}`).join(", ")
            : "No categories available";

        const { object } = await generateObject({
            model: openrouter(process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini"),
            schema: z.object({
                name: z.string().describe("The name of the product. Keep it clear and concise."),
                description: z.string().describe("A professional, SEO-friendly description of the product, including brand and nutritional information if visible. Around 2-3 sentences."),
                price: z.number().describe("Estimate a realistic logical price in INR (e.g., 50, 100, 250) based on typical grocery prices in India."),
                unit: z.string().describe("Unit of measurement (e.g., 'each', '1kg', '500g', 'pack', 'bunch')."),
                categoryId: z.string().nullable().describe("The ID of the most relevant category from the provided list. Return null if absolutely none match."),
                suggestedTags: z.array(z.string()).describe("List of 3-5 tags for semantic search (e.g., 'dairy', 'organic', 'snack').")
            }),
            messages: [
                {
                    role: "system",
                    content: `You are an expert grocery catalog AI. Extract product information from the provided image.
                    Available categories: ${categoriesContext}.
                    Choose the best matching categoryId from the list provided.
                    Provide a realistic price in INR. Keep the tone professional.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Please catalogue this grocery product:" },
                        { type: "image", image: image },
                    ],
                },
            ],
        });

        return Response.json(object);
    } catch (error) {
        console.error("Error cataloging product from image:", error);
        return new Response("Failed to catalog product from image", { status: 500 });
    }
}
