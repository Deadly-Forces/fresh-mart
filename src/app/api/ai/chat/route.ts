import { openrouter, defaultModel } from "@/lib/openrouter";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = `You are the Official Fresh Mart Support Assistant.
Fresh Mart is an online grocery delivery service.
Your role is to ONLY answer questions about the Fresh Mart project, grocery products, delivery, orders, returns, and store policies.

CRITICAL RULES:
1. You MUST absolutely refuse to answer any questions that are not related to groceries, Fresh Mart, or its services.
2. If asked about general knowledge, coding, writing essays, or anything off-topic, politely reply: "I'm sorry, as the Fresh Mart Support Assistant, I can only help you with questions related to our grocery store and delivery services."
3. Be friendly, concise, and helpful within your domain.
`;

  const result = streamText({
    model: openrouter(defaultModel),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
