"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Handle the raw text stream from the backend
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let assistantMsg = "";
        const msgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          { id: msgId, role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Simple parsing: if the backend sends `0:"text"` format (Vercel AI SDK text stream)
          // We'll just append it directly for now, or clean it if it has prefixes.
          // A proper implementation would parse the stream tokens.
          const textLines = chunk.split("\n").filter(Boolean);
          for (const line of textLines) {
            try {
              // Try to parse Vercel AI SDK data stream format (0:"chunk")
              if (line.startsWith("0:")) {
                const text = JSON.parse(line.substring(2));
                assistantMsg += text;
              } else {
                assistantMsg += chunk; // fallback
              }
            } catch {
              assistantMsg += chunk;
            }
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    content: assistantMsg
                      .replace(/0:"/g, "")
                      .replace(/"$/g, "")
                      .replace(/\\n/g, "\n")
                      .replace(/\\"/g, '"'),
                  }
                : m,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl shadow-green-900/20 bg-green-600 hover:bg-green-700 animate-in slide-in-from-bottom-5"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 sm:w-[350px] shadow-xl shadow-green-900/10 flex flex-col h-[500px] z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <CardHeader className="bg-green-600 text-primary-foreground rounded-t-lg flex flex-row items-center justify-between p-4 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">
              Fresh Mart Support
            </CardTitle>
            <p className="text-xs text-green-100">
              Ask us anything about groceries!
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-green-700 hover:text-white rounded-full h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-10 space-y-2">
                <Store className="h-8 w-8 mx-auto text-green-200" />
                <p>
                  Hi there! 👋 How can I help you with your groceries today?
                </p>
              </div>
            )}

            {messages.map((m: any) => (
              <div
                key={m.id}
                className={`flex flex-col gap-1 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
                    m.role === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-muted rounded-bl-none prose prose-sm dark:prose-invert break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>table]:my-2"
                  }`}
                >
                  {m.role === "user" ? (
                    m.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {m.role === "user" ? "You" : "Assistant"}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-1 items-center bg-muted w-fit px-3 py-2 rounded-lg rounded-bl-none mt-2">
                <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <div className="p-3 border-t bg-background rounded-b-lg">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 text-sm rounded-full focus-visible:ring-green-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
