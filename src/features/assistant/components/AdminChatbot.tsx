"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import {
    BarChart3, X, Send, Loader2, ShoppingBag,
    Package, TrendingUp, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const QUICK_PROMPTS = [
    { icon: TrendingUp, label: "Today's stats", text: "Give me today's order stats and revenue." },
    { icon: Package, label: "Low stock", text: "Which products are running low on stock?" },
    { icon: ShoppingBag, label: "Top products", text: "What are the top 10 best-selling products?" },
    { icon: DollarSign, label: "Revenue", text: "Summarize our revenue for the last 30 days." },
];

export function AdminChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const transport = useMemo(() => new DefaultChatTransport({ api: "/api/admin/chat" }), []);
    const { messages, sendMessage, status } = useChat({ transport });

    const isLoading = status === "streaming" || status === "submitted";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;
        sendMessage({ text: trimmed } as any);
        setInputText("");
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSend(inputText);
    };

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                title="Admin AI Assistant"
                aria-label="Open Admin AI"
                className={cn(
                    "fixed bottom-6 right-6 z-50 w-13 h-13 p-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-white text-sm font-semibold transition-all duration-200 hover:scale-105",
                    isOpen
                        ? "bg-slate-700 hover:bg-slate-800"
                        : "bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
                )}
            >
                {isOpen ? <X className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 sm:w-[420px] max-h-[640px] h-[75vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                <BarChart3 className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm leading-tight">FreshMart Admin AI</p>
                                <p className="text-[11px] text-white/70">Business intelligence assistant</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} title="Close" className="opacity-70 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
                        {messages.length === 0 && (
                            <div className="space-y-4">
                                <div className="text-center py-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/50 dark:to-indigo-950/50 mx-auto flex items-center justify-center mb-3">
                                        <BarChart3 className="w-7 h-7 text-violet-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">Admin AI Assistant</p>
                                    <p className="text-xs text-muted-foreground mt-1">Ask me about orders, inventory, sales & more</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
                                        <button
                                            key={label}
                                            onClick={() => handleSend(text)}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background border border-border/60 text-xs font-medium text-left hover:border-violet-400/50 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
                                        >
                                            <Icon className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                                {m.role === "assistant" && (
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/50 dark:to-indigo-950/50 flex items-center justify-center shrink-0 mt-0.5">
                                        <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed",
                                        m.role === "user"
                                            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm"
                                            : "bg-background border border-border/60 shadow-sm rounded-bl-sm prose prose-xs dark:prose-invert"
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
                                            const tp = part as { toolCallId: string; toolName: string; state: string };
                                            return (
                                                <div key={tp.toolCallId} className="text-[11px] text-muted-foreground my-1 flex items-center gap-1.5 italic">
                                                    {tp.state === "call" || tp.state === "input-available"
                                                        ? <><Loader2 className="w-3 h-3 animate-spin text-violet-500" /> Querying {tp.toolName}...</>
                                                        : <><span className="text-emerald-500">✓</span> {tp.toolName} done</>}
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
                                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center shrink-0">
                                    <BarChart3 className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                                </div>
                                <div className="px-3.5 py-3 rounded-2xl bg-background border border-border/60 shadow-sm flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce delay-150" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce delay-300" />
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
                                placeholder="Ask about orders, revenue, inventory..."
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-border/60 bg-secondary/40 focus:bg-background focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 focus:outline-none transition-all text-sm"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1.5 top-1.5 bottom-1.5 h-auto w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40"
                                disabled={isLoading || !inputText.trim()}
                                title="Send"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
