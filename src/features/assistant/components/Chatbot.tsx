"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
    const { messages, sendMessage, status } = useChat({ transport });

    const isLoading = status === "streaming" || status === "submitted";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed || isLoading) return;
        sendMessage({ text: trimmed } as any);
        setInputText("");
    };

    return (
        <>
            <Button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white z-50 flex items-center justify-center transition-transform hover:scale-105"
                onClick={() => setIsOpen(true)}
                aria-label="Open AI Assistant"
                title="Open AI Assistant"
            >
                <MessageCircle className="w-6 h-6" />
            </Button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 sm:w-96 max-h-[600px] h-[70vh] bg-background border rounded-2xl shadow-xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <h3 className="font-semibold">Fresh Mart AI Concierge</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} title="Close chat" className="opacity-70 hover:opacity-100 transition-opacity">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-10">
                                <Bot className="w-10 h-10 mx-auto opacity-50 mb-3" />
                                <p>Hi there! I&apos;m your AI shopping assistant.</p>
                                <p>I can help you find products, plan meals, or check your orders.</p>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                                {m.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <Bot className="w-5 h-5 text-emerald-600" />
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        "px-4 py-2 rounded-2xl max-w-[80%] text-sm",
                                        m.role === "user"
                                            ? "bg-emerald-600 text-white rounded-br-none"
                                            : "bg-background border shadow-sm rounded-bl-none prose prose-sm dark:prose-invert"
                                    )}
                                >
                                    {m.parts.map((part, i) => {
                                        if (part.type === "text") {
                                            return m.role === "user" ? (
                                                <span key={i}>{part.text}</span>
                                            ) : (
                                                <ReactMarkdown key={i}>{part.text}</ReactMarkdown>
                                            );
                                        }
                                        if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                                            const toolPart = part as { toolCallId: string; toolName: string; state: string };
                                            return (
                                                <div key={toolPart.toolCallId} className="text-xs text-muted-foreground mt-2 italic bg-muted p-2 rounded-md border">
                                                    {toolPart.state === "call" || toolPart.state === "input-available" ? (
                                                        <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Searching products...</span>
                                                    ) : (
                                                        <span>✓ Done</span>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        ))}

                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Bot className="w-5 h-5 text-emerald-600 animate-pulse" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-background border shadow-sm rounded-bl-none flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-150" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-300" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 border-t bg-background">
                        <div className="relative">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask me anything..."
                                className="w-full pl-4 pr-12 py-3 rounded-full border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-shadow text-sm"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 bottom-1 h-auto rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                                disabled={isLoading || !inputText.trim()}
                                title="Send message"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
