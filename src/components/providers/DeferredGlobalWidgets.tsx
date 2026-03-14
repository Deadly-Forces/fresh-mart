"use client";

import dynamic from "next/dynamic";

const PushPrompt = dynamic(
  () =>
    import("@/features/notifications/components/PushPrompt").then(
      (mod) => mod.PushPrompt,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

const Chatbot = dynamic(
  () =>
    import("@/features/assistant/components/Chatbot").then(
      (mod) => mod.Chatbot,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

export function DeferredGlobalWidgets() {
  return (
    <>
      <PushPrompt />
      <Chatbot />
    </>
  );
}
