import { CookingAssistant } from "@/features/assistant/components/CookingAssistant";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Culinary Concierge | Fresh Mart",
  description:
    "AI-powered culinary intelligence — precision recipes from real inventory.",
};

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] py-10 md:py-16 px-4">
      <CookingAssistant />
    </div>
  );
}
