import { openrouter, defaultModel } from "@/lib/openrouter";
import { generateText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { name, points } = await req.json();

    const { text } = await generateText({
      model: openrouter(defaultModel),
      system: `You are the welcoming AI assistant for the Fresh Mart loyalty program.
Your goal is to write a very short, personalized welcome or congratulatory message for the customer.
Keep the tone warm, fun, and appreciative. 
Include emojis! 
Strictly keep it under 2 sentences.`,
      prompt: `The customer's name is ${name || "Valued Shopper"} and they have ${points || 0} loyalty points. Write them a quick, fun greeting recognizing their points!`,
    });

    return Response.json({ message: text });
  } catch (error) {
    console.error("Error generating loyalty message:", error);
    return new Response("Failed to generate loyalty message", { status: 500 });
  }
}
