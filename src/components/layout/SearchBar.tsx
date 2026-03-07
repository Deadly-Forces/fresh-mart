"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, Loader2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const handleMagicSearch = async () => {
    if (!query.trim()) return;
    setIsMagicLoading(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          const combinedQuery = data.products.join(",");
          const recipeFlag = data.isRecipe ? "&recipe=true" : "";
          const titleParam = data.isRecipe ? `&title=${encodeURIComponent(query.trim())}` : "";
          router.push(`/shop?q=${encodeURIComponent(combinedQuery)}&ai=true${recipeFlag}${titleParam}`);
        } else {
          router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
        }
      }
    } catch (e) {
      console.error("Magic search failed", e);
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        const res = await fetch("/api/ai/vision-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            const combinedQuery = data.products.join(",");
            router.push(`/shop?q=${encodeURIComponent(combinedQuery)}&ai=true`);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setIsImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Detect if the query is a natural-language/contextual phrase that benefits from AI expansion
  const isContextualQuery = (q: string): boolean => {
    const lower = q.toLowerCase().trim();
    // Contextual signals: filler words, recipe-related words, or multi-word queries with no obvious product name
    const contextualPatterns = [
      /\bfor\b/, /\bwith\b/, /\brecipe\b/, /\bingredients?\b/, /\bmake\b/,
      /\bcook\b/, /\bdish\b/, /\bmeal\b/, /\blunch\b/, /\bdinner\b/, /\bbreakfast\b/,
      /\bsnack\b/, /\bhealthy\b/, /\bvegan\b/, /\bvegetarian\b/, /\blike\b/,
    ];
    return contextualPatterns.some((p) => p.test(lower));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // Auto-upgrade contextual queries to AI-powered search
    if (isContextualQuery(trimmed)) {
      await handleMagicSearch();
      return;
    }

    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  const isLoading = isMagicLoading || isImageLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative group",
        mobile ? "flex w-full" : "hidden md:flex w-[280px] lg:w-[400px]",
      )}
    >
      <div
        className={cn(
          "relative flex-1 flex items-center w-full rounded-2xl border border-border/50 bg-secondary/40 px-4 transition-[border-color,box-shadow] duration-200",
          "focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10",
          mobile ? "h-12" : "h-11",
        )}
      >
        {/* Search icon */}
        <Search className="w-[18px] h-[18px] text-muted-foreground shrink-0 mr-3" />

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or paste a link..."
          className="w-full bg-transparent border-none text-foreground text-[15px] font-light placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
          disabled={isLoading}
        />

        {/* Action icons */}
        <div className="flex items-center gap-3 ml-2 shrink-0">
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
            title="Upload Image"
            aria-label="Upload Image"
          />

          {/* Visual search (camera) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
            title="Search by image"
            aria-label="Search with Image"
          >
            {isImageLoading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin text-primary" />
            ) : (
              <Camera className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* AI search (sparkles) */}
          <button
            type="button"
            onClick={handleMagicSearch}
            disabled={isLoading || !query.trim()}
            className="p-0.5 text-amber-500 hover:text-amber-400 transition-colors duration-200 disabled:opacity-40"
            title="AI Search Assistant"
            aria-label="AI Magic Search"
          >
            {isMagicLoading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <Sparkles className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
