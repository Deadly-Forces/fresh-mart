"use client";

import { useState, FormEvent } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      resetAfterDelay();
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }

    resetAfterDelay();
  }

  function resetAfterDelay() {
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 4000);
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-3xl bg-gradient-to-r from-primary/5 via-emerald-500/5 to-teal-500/5 border border-primary/10">
      <div className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-2">
          <Send className="w-3.5 h-3.5" />
          Newsletter
        </span>
        <h3 className="text-xl font-bold text-foreground mb-1">
          Stay in the loop
        </h3>
        <p className="text-sm text-muted-foreground">
          Fresh deals and new arrivals straight to your inbox.
        </p>
      </div>
      <form
        onSubmit={handleSubscribe}
        className="flex flex-col w-full md:w-auto max-w-md gap-2"
      >
        <div className="flex gap-2">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="flex-1 h-12 px-5 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white text-sm font-semibold hover:shadow-glow transition-all duration-300 shrink-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === "loading" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {status === "success" && <CheckCircle2 className="w-4 h-4" />}
            {status === "success" ? "Subscribed!" : "Subscribe"}
          </button>
        </div>
        {message && (
          <p
            className={`text-xs flex items-center gap-1.5 transition-all ${
              status === "success" ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
