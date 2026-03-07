"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, Loader2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
          const combinedQuery = data.products.join(" ");
          router.push(`/shop?q=${encodeURIComponent(combinedQuery)}&ai=true`);
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
            const combinedQuery = data.products.join(" ");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isLoading = isMagicLoading || isImageLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative group",
        mobile ? "flex w-full" : "hidden md:flex w-[240px] lg:w-[320px]", // slightly wider for icons
      )}
    >
      <div className="relative flex-1 flex w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or paste recipe..."
          className={cn(
            "w-full pl-9 pr-[5.5rem] rounded-lg border border-border/60 bg-secondary/50 text-sm placeholder:text-muted-foreground/70",
            "focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all",
            mobile ? "h-10" : "h-9",
          )}
          disabled={isLoading}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {/* File Upload Hidden Input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
            title="Upload Image"
            aria-label="Upload Image"
          />
          {/* Camera Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Search with Image (Visual Search)"
            aria-label="Search with Image"
          >
            {isImageLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </Button>

          {/* AI Magic Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMagicSearch}
            disabled={isLoading || !query.trim()}
            className="h-7 px-2 text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-100/50"
            title="AI Magic Search (Recipe to Ingredients)"
          >
            {isMagicLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            <span className="sr-only sm:not-sr-only">AI</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
