"use client";

import React, { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/* ── Static filter definitions moved inside component to use props ── */
interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  title: string;
  paramKey: string;
  options: FilterOption[];
}

/* ── Helpers ── */
function getParamSet(searchParams: URLSearchParams, key: string): Set<string> {
  const raw = searchParams.get(key);
  if (!raw) return new Set();
  return new Set(raw.split(",").filter(Boolean));
}

/* ── Collapsible section ── */
function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="py-4 border-b border-border/40">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && children}
    </div>
  );
}
/* ── Main component ── */
export function FilterSidebar({
  className,
  categoryCounts = {},
}: {
  className?: string;
  categoryCounts?: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for smooth dragging
  const initialPriceMax = Number(searchParams.get("maxPrice") || "1800");
  const [localPrice, setLocalPrice] = useState(initialPriceMax);

  // Sync local state when URL changes externally
  React.useEffect(() => {
    setLocalPrice(Number(searchParams.get("maxPrice") || "1800"));
  }, [searchParams]);

  const filterGroups: FilterGroup[] = React.useMemo(
    () => [
      {
        title: "Category",
        paramKey: "category",
        options: [
          {
            label: "Vegetables",
            value: "vegetables",
            count: categoryCounts["vegetables"] ?? 0,
          },
          {
            label: "Fruits",
            value: "fruits",
            count: categoryCounts["fruits"] ?? 0,
          },
          {
            label: "Dairy & Eggs",
            value: "dairy-eggs",
            count: categoryCounts["dairy-eggs"] ?? 0,
          },
          {
            label: "Bakery",
            value: "bakery",
            count: categoryCounts["bakery"] ?? 0,
          },
          {
            label: "Meat & Seafood",
            value: "meat-seafood",
            count: categoryCounts["meat-seafood"] ?? 0,
          },
          {
            label: "Snacks",
            value: "snacks",
            count: categoryCounts["snacks"] ?? 0,
          },
          {
            label: "Beverages",
            value: "beverages",
            count: categoryCounts["beverages"] ?? 0,
          },
          {
            label: "Personal Care",
            value: "personal-care",
            count: categoryCounts["personal-care"] ?? 0,
          },
          {
            label: "Household",
            value: "household",
            count: categoryCounts["household"] ?? 0,
          },
          {
            label: "Baby Care",
            value: "baby-care",
            count: categoryCounts["baby-care"] ?? 0,
          },
        ],
      },
      {
        title: "Dietary",
        paramKey: "dietary",
        options: [
          { label: "Organic", value: "Organic" },
          { label: "On Sale", value: "Sale" },
          { label: "New Arrivals", value: "New" },
          { label: "Bestsellers", value: "Bestseller" },
        ],
      },
      {
        title: "Rating",
        paramKey: "rating",
        options: [
          { label: "4★ & above", value: "4" },
          { label: "3★ & above", value: "3" },
          { label: "2★ & above", value: "2" },
        ],
      },
    ],
    [categoryCounts],
  );

  const priceMax = Number(searchParams.get("maxPrice") || "1800");
  const inStockOnly = searchParams.get("inStock") === "1";

  const pushParams = useCallback(
    (update: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      update(params);
      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const toggleValue = useCallback(
    (paramKey: string, value: string) => {
      pushParams((params) => {
        const set = getParamSet(params, paramKey);
        if (set.has(value)) set.delete(value);
        else set.add(value);
        if (set.size === 0) params.delete(paramKey);
        else params.set(paramKey, [...set].join(","));
      });
    },
    [pushParams],
  );

  const applyPriceFilter = useCallback(() => {
    pushParams((params) => {
      if (localPrice >= 1800) params.delete("maxPrice");
      else params.set("maxPrice", String(localPrice));
    });
  }, [pushParams, localPrice]);

  const toggleInStock = useCallback(() => {
    pushParams((params) => {
      if (inStockOnly) params.delete("inStock");
      else params.set("inStock", "1");
    });
  }, [pushParams, inStockOnly]);

  const hasActiveFilters =
    searchParams.has("category") ||
    searchParams.has("dietary") ||
    searchParams.has("rating") ||
    searchParams.has("maxPrice") ||
    searchParams.has("inStock") ||
    searchParams.has("brand");

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("dietary");
    params.delete("rating");
    params.delete("maxPrice");
    params.delete("inStock");
    params.delete("brand");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setLocalPrice(1800);
  }, [router, pathname, searchParams]);

  return (
    <aside className={cn("w-[280px] shrink-0", className)}>
      <div className="sticky top-[132px] max-h-[calc(100vh-160px)] overflow-y-auto pr-2 scrollbar-hide rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm p-5 shadow-soft">
        <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
          Filters
        </h3>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors mb-3 underline underline-offset-2"
          >
            Clear all filters
          </button>
        )}

        {/* Price Range */}
        <CollapsibleSection title="Price Range" defaultOpen>
          <div className="mt-4 px-1">
            <input
              type="range"
              min="0"
              max="1800"
              step="50"
              value={localPrice}
              onChange={(e) => setLocalPrice(Number(e.target.value))}
              onMouseUp={applyPriceFilter}
              onTouchEnd={applyPriceFilter}
              className="w-full accent-primary h-1"
              title="Price range"
              aria-label="Price range filter"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>₹0</span>
              <span className="font-medium text-foreground">
                ₹{localPrice >= 1800 ? "1800+" : localPrice}
              </span>
            </div>
          </div>
        </CollapsibleSection>

        {/* Filter Groups */}
        {filterGroups.map((group) => {
          const activeSet = getParamSet(searchParams, group.paramKey);
          return (
            <CollapsibleSection
              key={group.title}
              title={group.title}
              defaultOpen
            >
              <div className="mt-3 space-y-3">
                {group.options.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`${group.paramKey}-${opt.value}`}
                      checked={activeSet.has(opt.value)}
                      onCheckedChange={() =>
                        toggleValue(group.paramKey, opt.value)
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`${group.paramKey}-${opt.value}`}
                      className="text-sm text-foreground cursor-pointer flex-1"
                    >
                      {opt.label}
                    </Label>
                    {opt.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        ({opt.count})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          );
        })}

        {/* In-Stock Toggle */}
        <div className="py-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={toggleInStock}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor="in-stock"
              className="text-sm font-medium cursor-pointer"
            >
              In Stock Only
            </Label>
          </div>
        </div>
      </div>
    </aside>
  );
}
