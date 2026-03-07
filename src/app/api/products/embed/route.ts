import { NextResponse } from "next/server";
import { generateProductEmbedding } from "@/lib/embeddings/generate";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support either a direct productId or a Supabase Webhook payload
    let productId = body.productId;
    if (body.record && body.record.id) {
      productId = body.record.id;
    }

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const success = await generateProductEmbedding(productId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to generate embedding" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Embedding API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
