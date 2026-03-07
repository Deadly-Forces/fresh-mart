"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  ChefHat,
  User,
  Loader2,
  Sparkles,
  Command,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import styles from "./CookingAssistant.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  {
    title: "Curated Morning Fuel",
    desc: "Elevated breakfast crafted from today's harvest",
    span: "col-span-2",
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    title: "15-Minute Power Plate",
    desc: "Executive dining, zero compromise",
    span: "col-span-1",
    accent: "from-amber-500/20 to-amber-500/5",
  },
  {
    title: "The Green Protocol",
    desc: "Plant-forward compositions for peak performance",
    span: "col-span-1",
    accent: "from-teal-500/20 to-teal-500/5",
  },
  {
    title: "Grand Finale Desserts",
    desc: "Indulgent closers using seasonal fruits",
    span: "col-span-1",
    accent: "from-rose-500/20 to-rose-500/5",
  },
  {
    title: "Sunday Slow Cook",
    desc: "Artisanal recipes worth the wait",
    span: "col-span-1",
    accent: "from-violet-500/20 to-violet-500/5",
  },
];

function TiltCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -8;
    const tiltY = (x - 0.5) * 8;

    cardRef.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    spotlightRef.current.style.setProperty("--mouse-x", `${x * 100}%`);
    spotlightRef.current.style.setProperty("--mouse-y", `${y * 100}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current || !spotlightRef.current) return;
    cardRef.current.style.transform =
      "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    spotlightRef.current.style.setProperty("--mouse-x", "50%");
    spotlightRef.current.style.setProperty("--mouse-y", "50%");
  }, []);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.setProperty("--mouse-x", "50%");
      spotlightRef.current.style.setProperty("--mouse-y", "50%");
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer transition-[transform] duration-300 ease-out ${styles.tiltCard} ${className ?? ""}`}
    >
      {/* Spotlight shimmer */}
      <div
        ref={spotlightRef}
        className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${styles.spotlight}`}
      />
      {children}
    </div>
  );
}

export function CookingAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput ?? input;
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      if (data.choices?.[0]?.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.choices[0].message.content },
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection interrupted. Our systems are recalibrating \u2014 please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showHero = messages.length === 0;

  return (
    <div
      className={`w-full max-w-5xl mx-auto flex flex-col relative ${styles.container}`}
    >
      {/* Ambient mesh gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/[0.04] blur-[120px] animate-pulse ${styles.meshGradient1}`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/[0.03] blur-[100px] animate-pulse ${styles.meshGradient2}`}
        />
        <div
          className={`absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-amber-500/[0.02] blur-[80px] animate-pulse ${styles.meshGradient3}`}
        />
      </div>

      <AnimatePresence mode="wait">
        {showHero ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            {/* Hero header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-medium tracking-[0.2em] uppercase text-emerald-400/80 bg-emerald-500/[0.08] border border-emerald-500/[0.12] px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="h-3 w-3" />
                Culinary Intelligence Engine
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white/95 mb-3">
                What shall we compose?
              </h2>
              <p className="text-sm text-white/40 max-w-md mx-auto font-mono">
                Precision recipes. Real inventory. Zero guesswork.
              </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {SUGGESTIONS.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                  className={`${i === 0 ? "col-span-2" : "col-span-1"} group`}
                >
                  <TiltCard
                    onClick={() => handleSend(s.desc)}
                    className="h-full"
                  >
                    <div
                      className={`relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 transition-colors duration-300 group-hover:border-emerald-500/20 group-hover:bg-white/[0.05]`}
                    >
                      {/* Gradient accent top line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />

                      <div className="relative z-10">
                        <h3 className="text-sm font-semibold text-white/90 mb-1.5 tracking-tight">
                          {s.title}
                        </h3>
                        <p className="text-xs text-white/35 font-mono leading-relaxed">
                          {s.desc}
                        </p>
                        <div className="mt-3 flex items-center gap-1 text-emerald-400/60 group-hover:text-emerald-400 transition-colors duration-300">
                          <span className="text-[10px] font-mono uppercase tracking-wider">
                            Explore
                          </span>
                          <ArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl"
          >
            <ScrollArea className="h-[calc(100vh-20rem)]" ref={scrollRef}>
              <div className="flex flex-col gap-1 p-6">
                {messages.map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3 py-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar
                      className={`h-7 w-7 shrink-0 mt-0.5 ring-1 ${
                        message.role === "assistant"
                          ? "ring-emerald-500/20 bg-emerald-500/[0.08]"
                          : "ring-white/10 bg-white/[0.05]"
                      }`}
                    >
                      <AvatarFallback className="bg-transparent">
                        {message.role === "assistant" ? (
                          <ChefHat size={14} className="text-emerald-400" />
                        ) : (
                          <User size={14} className="text-white/50" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap ${
                        message.role === "assistant"
                          ? "bg-white/[0.04] text-white/80 rounded-tl-md border border-white/[0.06]"
                          : "bg-emerald-500/90 text-white rounded-tr-md"
                      }`}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 py-3"
                  >
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5 ring-1 ring-emerald-500/20 bg-emerald-500/[0.08]">
                      <AvatarFallback className="bg-transparent">
                        <ChefHat size={14} className="text-emerald-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white/[0.04] border border-white/[0.06] flex items-center gap-2.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                      <span className="text-xs text-white/40 font-mono">
                        Composing recipe...
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 sticky bottom-6"
      >
        <div
          className={`relative rounded-2xl transition-all duration-500 ${
            isFocused
              ? "shadow-[0_0_40px_-8px_rgba(16,185,129,0.2)]"
              : "shadow-[0_0_20px_-8px_rgba(16,185,129,0.05)]"
          }`}
        >
          {/* Satin-finish gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] pointer-events-none">
            <div
              className={`h-full w-full rounded-2xl transition-opacity duration-500 ${isFocused ? "opacity-100" : "opacity-40"} ${styles.commandBarBorder}`}
            />
          </div>

          <div className="relative flex items-center gap-3 bg-[#0B0B0B]/90 backdrop-blur-2xl rounded-2xl px-5 py-4">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors duration-300 ${isFocused ? "bg-emerald-500/10" : "bg-white/[0.04]"}`}
            >
              <Command
                className={`h-4 w-4 transition-colors duration-300 ${isFocused ? "text-emerald-400" : "text-white/30"}`}
              />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              placeholder="Describe your cravings, ingredients, or mood..."
              className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 font-mono outline-none disabled:opacity-50"
            />

            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-9 w-9 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-[10px] text-white/20 font-mono tracking-wider uppercase">
            Fresh Mart Culinary AI
          </span>
          <span className="text-white/10">&middot;</span>
          <span className="text-[10px] text-white/15 font-mono">
            Inventory-aware recipes
          </span>
        </div>
      </motion.div>
    </div>
  );
}
