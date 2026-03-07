import { NextResponse } from "next/server";
import products from "@/features/products/utils/products.json";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Waterfall of free models — tried in order until one succeeds (not rate-limited)
// All IDs verified as available on OpenRouter free tier
const MODEL_WATERFALL = [
  process.env.OPENROUTER_MODEL,
  "google/gemma-3-4b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
].filter(Boolean) as string[];

// Deduplicate while preserving order
const MODELS = [...new Set(MODEL_WATERFALL)];

const storeProductNames = products.map((p: any) => p.name).join(", ");

const SYSTEM_PROMPT = `
You are the Fresh Mart Cooking Assistant. Your goal is to help users find recipes and meal ideas based on the ingredients they have or want to use.

CRITICAL INSTRUCTIONS:
1. You MUST prioritize recommending products that are available in the Fresh Mart store.
2. Here is the list of products currently available in the store (separated by commas):
   ${storeProductNames}
3. When suggesting a recipe, explicitly mention the ingredients needed. For ingredients available in the store, use their EXACT name from the list above.
4. If a recipe requires an ingredient NOT in the store list, you MUST clearly mark it as an "Alternative/Suggested Item (Not currently in store)".
5. Keep your responses concise, friendly, and formatted in Markdown.
6. Do NOT make up products that are not in the list.

Format your recipe suggestions clearly with:
- Recipe Name
- Ingredients (categorized into "Available at Fresh Mart" and "Other Ingredients")
- Instructions
`;

export async function POST(req: Request) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API Key is not configured." },
      { status: 500 },
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format." },
        { status: 400 },
      );
    }

    const callModel = async (model: string) => {
      return fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        }),
      });
    };

    // Try each model in the waterfall until one succeeds
    let lastResponse: Response | null = null;
    for (const model of MODELS) {
      const response = await callModel(model);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      // Retry on rate-limit (429), model-not-found (404), or server errors (5xx)
      if (response.status !== 429 && response.status !== 404 && response.status < 500) {
        const errorData = await response.text();
        console.error(`Model ${model} returned client error:`, errorData);
        return NextResponse.json(
          { error: "Failed to fetch from OpenRouter API." },
          { status: response.status },
        );
      }
      console.warn(`Model ${model} failed (${response.status}), trying next model...`);
      lastResponse = response;
    }

    // All models failed
    const errorData = await lastResponse?.text();
    console.error("All models failed. Last error:", errorData);
    return NextResponse.json(
      { error: "All AI models are currently unavailable. Please try again shortly." },
      { status: 503 },
    );
  } catch (error) {
    console.error("Error in assistant API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
