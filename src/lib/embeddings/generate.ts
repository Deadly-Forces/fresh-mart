import { supabaseAdmin } from "@/lib/supabase/admin";

export async function generateEmbedding(text: string): Promise<number[]> {
  // We use OpenAI's embedding model since it outputs 1536 dimension vectors.
  // Make sure to add OPENAI_API_KEY to your .env.local
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn(
      "OPENAI_API_KEY is missing. Using dummy embeddings for development.",
    );
    // Return a dummy 1536-dimensional array if no API key is provided for dev mode.
    return new Array(1536).fill(0).map(() => Math.random() - 0.5);
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text.replace(/\n/g, " "), // strip newlines as recommended by OpenAI
      model: "text-embedding-3-small",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to generate embedding: ${response.status} ${errorBody}`,
    );
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function generateProductEmbedding(productId: string) {
  // 1. Fetch the product details
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("name, description, tags")
    .eq("id", productId)
    .single();

  if (error || !product) {
    console.error("Error fetching product for embedding:", error);
    return null;
  }

  // 2. Prepare the text to embed
  const contentToEmbed = `
Product: ${product.name}
Description: ${product.description || ""}
Tags: ${(product.tags || []).join(", ")}
  `.trim();

  // 3. Generate embedding
  let embeddingVector: number[];
  try {
    embeddingVector = await generateEmbedding(contentToEmbed);
  } catch (err) {
    console.error("Error generating embedding:", err);
    return null;
  }

  // 4. Save embedding to Supabase
  // We need to pass the array as a string of comma-separated values inside brackets
  // e.g., '[0.1, 0.2, ...]'
  const embeddingString = `[${embeddingVector.join(",")}]`;

  const { error: updateError } = await supabaseAdmin
    .from("products")
    .update({ embedding: embeddingString })
    .eq("id", productId);

  if (updateError) {
    console.error("Error saving embedding:", updateError);
    return null;
  }

  return true;
}
