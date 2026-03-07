import { createOpenRouter } from "@openrouter/ai-sdk-provider";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error(
    "OPENROUTER_API_KEY is not defined in environment variables.",
  );
}

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const defaultModel = process.env.OPENROUTER_MODEL || "openrouter/free";
export const fallbackModel =
  process.env.OPENROUTER_FALLBACK_MODEL || "openrouter/free";
