"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(
  () => import("@/components/store/ChatWidget").then((mod) => mod.ChatWidget),
  {
    ssr: false,
    loading: () => null,
  },
);

export function DeferredStoreWidgets() {
  return <ChatWidget />;
}
