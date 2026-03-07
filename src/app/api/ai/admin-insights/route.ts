import { openrouter, defaultModel } from "@/lib/openrouter";
import { generateText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { topic, type } = await req.json();

    if (!topic) {
      return new Response("Topic is required", { status: 400 });
    }

    // Default to an SMS promotion if not specified
    const promptType =
      type === "email"
        ? "a catchy, engaging promotional email"
        : type === "push"
          ? "a short, attention-grabbing mobile push notification"
          : "a punchy, fun SMS text message";

    const { text } = await generateText({
      model: openrouter(defaultModel),
      system: `You are an expert digital marketer for Fresh Mart, an online grocery delivery startup.
Your goal is to write ${promptType}. 
Keep the tone energetic, fresh, and appetizing. Include emojis.
If writing an SMS or Push Notification, keep it under 150 characters.
If writing an email, keep it under 3 short paragraphs with an exciting subject line starting with "SUBJECT:".`,
      prompt: `Write marketing copy for the following topic/promotion: "${topic}"`,
    });

    return Response.json({ copy: text });
  } catch (error) {
    console.error("Error generating marketing copy:", error);
    return new Response("Failed to generate marketing copy", { status: 500 });
  }
}
