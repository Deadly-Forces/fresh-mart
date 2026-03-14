import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const supportTriageSchema = z.object({
  category: z.enum([
    "where_is_my_order",
    "missing_item",
    "quality_issue",
    "refund_request",
    "general_inquiry",
    "other",
  ]),
  priority: z
    .enum(["low", "medium", "urgent"])
    .describe("Quality issues with perishables or missing entire orders are urgent."),
  summary: z.string().describe("1 sentence summary of the customer's problem."),
  suggested_action: z
    .enum(["auto_reply", "escalate_to_human", "auto_refund"])
    .describe("What should the system do next?"),
  draft_response: z
    .string()
    .describe("A polite, empathetic draft response to the customer."),
});

export type SupportTriageResult = z.infer<typeof supportTriageSchema>;

export async function triageSupportMessage(
  message: string,
  orderContext: unknown = null,
) {
  const { object } = await generateObject({
    model: openrouter(
      process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini",
    ),
    schema: supportTriageSchema,
    messages: [
      {
        role: "system",
        content:
          "You are an AI Support Triage Agent for Fresh Mart. You categorize incoming customer support messages, determine priority, and draft responses. Fresh Mart prioritizes speedy resolution for spoiled or missing groceries.",
      },
      {
        role: "user",
        content: `Customer Message: "${message}"\nOrder Context: ${
          orderContext ? JSON.stringify(orderContext) : "None"
        }`,
      },
    ],
  });

  return object;
}
