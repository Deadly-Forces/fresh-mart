import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { fetchProductReviews } from "@/lib/supabase/reviews";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const { reviews } = await fetchProductReviews(productId);

        // Only approved reviews that have a comment
        const comments = reviews
            .filter(r => r.is_approved && r.comment && r.comment.length > 5)
            .map(r => `Rating: ${r.rating} - ${r.comment}`);

        if (comments.length < 3) {
            return NextResponse.json({
                summary: null // Not enough text to summarize
            }, {
                headers: { 'Cache-Control': 's-maxage=3600' } // Cache short term
            });
        }

        // Limit to 50 most recent valid reviews to avoid massive token usage
        const recentComments = comments.slice(0, 50).join("\n- ");

        const { text } = await generateText({
            model: openrouter(process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini"),
            system: "You are an AI Review Analyzer for Fresh Mart. Write a 2-3 sentence summary of the provided customer reviews. Highlight the main pros and cons. Keep it helpful, objective, and retail-oriented. Do not use quotes around the summary.",
            prompt: `Here are the latest customer reviews for a product:\n- ${recentComments}\n\nProvide a concise summary of these reviews.`,
        });

        return NextResponse.json({ summary: text.trim() }, {
            headers: {
                'Cache-Control': 's-maxage=86400, stale-while-revalidate', // Cache for 24 hours
            }
        });

    } catch (error) {
        console.error("Error generating review summary:", error);
        return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
    }
}
