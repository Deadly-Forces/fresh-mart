"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Vegetables", slug: "vegetables" },
  { name: "Fruits", slug: "fruits" },
  { name: "Dairy & Eggs", slug: "dairy-eggs" },
  { name: "Bakery", slug: "bakery" },
  { name: "Meat & Seafood", slug: "meat-seafood" },
  { name: "Cooking Essentials", slug: "cooking-essentials" },
  { name: "Spices & Seasonings", slug: "spices-seasonings" },
  { name: "Staples", slug: "staples" },
  { name: "Snacks", slug: "snacks" },
  { name: "Beverages", slug: "beverages" },
  { name: "Personal Care", slug: "personal-care" },
  { name: "Household", slug: "household" },
  { name: "Baby Care", slug: "baby-care" },
];

export function CategoryStrip() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-background border-b border-border/40 relative z-40">
      <div className="container mx-auto px-4 max-w-7xl relative">
        {canScrollLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-md bg-background border border-border/50 items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5 px-0.5 snap-x"
        >
          {categories.map((cat) => {
            const isActive = pathname === `/category/${cat.slug}`;
            return (
              <Link
                key={cat.name}
                href={`/category/${cat.slug}`}
                className={cn(
                  "shrink-0 snap-start px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {canScrollRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-md bg-background border border-border/50 items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
