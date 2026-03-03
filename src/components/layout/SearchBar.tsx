"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative group",
        mobile ? "flex w-full" : "hidden md:flex w-[220px] lg:w-[280px]",
      )}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className={cn(
          "w-full pl-9 pr-3 rounded-lg border border-border/60 bg-secondary/50 text-sm placeholder:text-muted-foreground/70",
          "focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all",
          mobile ? "h-10" : "h-9",
        )}
      />
    </form>
  );
}
