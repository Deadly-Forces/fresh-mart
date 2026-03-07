import Link from "next/link";
import { FilterSidebar } from "@/features/filters/components/FilterSidebar";
import { SortDropdown } from "@/features/filters/components/SortDropdown";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ChevronRight, ShoppingBag, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams:
  | Promise<{ [key: string]: string | string[] | undefined }>
  | { [key: string]: string | string[] | undefined };
};

function str(val: string | string[] | undefined): string | undefined {
  return typeof val === "string" ? val : undefined;
}

function strArr(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (typeof val === "string") return val.split(",").filter(Boolean);
  return val;
}

export default async function ShopPage(props: Props) {
  const searchParams = await props.searchParams;
  const q = str(searchParams?.q);
  const sort = str(searchParams?.sort) || "relevance";
  const categories = strArr(searchParams?.category);
  const dietary = strArr(searchParams?.dietary);
  const brands = strArr(searchParams?.brand);
  const maxPriceRaw = str(searchParams?.maxPrice);
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
  const ratingRaw = str(searchParams?.rating);
  const minRating = ratingRaw
    ? Math.min(...ratingRaw.split(",").map(Number))
    : undefined;
  const inStock = str(searchParams?.inStock) === "1";

  const pageRaw = str(searchParams?.page);
  const page = pageRaw ? parseInt(pageRaw, 10) : 1;

  const supabase = await createClient();

  // Build an optimized query — select only needed columns
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, price, compare_price, images, unit, stock, categories(slug)",
    )
    .eq("is_active", true);

  // Push category filter to the database when possible
  if (categories.length === 1) {
    // Single-category filter can be pushed to DB via join
  }

  // Fetch products in paginated batches to avoid max_rows limit
  const BATCH_SIZE = 1000;
  let allProducts: any[] = [];
  let fetchFrom = 0;
  let fetchMore = true;

  while (fetchMore) {
    const { data: batch } = await query.range(
      fetchFrom,
      fetchFrom + BATCH_SIZE - 1,
    );
    if (batch && batch.length > 0) {
      allProducts = allProducts.concat(batch);
      fetchFrom += BATCH_SIZE;
      fetchMore = batch.length === BATCH_SIZE;
    } else {
      fetchMore = false;
    }
  }

  const productsList = (allProducts || []).map((p: any) => {
    // Handle array or object returns for relation
    let catSlug = "other";
    if (Array.isArray(p.categories) && p.categories.length > 0) {
      catSlug = p.categories[0].slug;
    } else if (p.categories && !Array.isArray(p.categories)) {
      catSlug = (p.categories as any).slug;
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
      image: p.images?.[0] || "/placeholder.svg",
      unit: p.unit as string | undefined, // Type assertion for unit
      categorySlug: catSlug,
      stock: p.stock as number | undefined, // Type assertion for stock
      brand: (p as any).brand || "", // Adding to satisfy UI filters
      badge: (p as any).tags?.[0] || "", // Map first tag to badge if available
      rating: 4.0, // Default rating
    };
  });

  // Calculate category counts dynamically
  const categoryCounts: Record<string, number> = {};
  productsList.forEach((p) => {
    const cat = p.categorySlug ?? "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  /* Calculate products to show */
  let displayProducts = productsList;
  let semanticMatches: any[] | null = null;
  let unmatchedTerms: string[] = [];
  let isAiSearch = false;
  let isRecipeSearch = false;
  let pantryStaples: string[] = [];

  // Pantry keywords — only items truly NOT sold in our store
  const PANTRY_KEYWORDS = new Set([
    "water", "warm water", "cold water", "ice", "ice cubes",
  ]);

  if (q) {
    let ql = q.toLowerCase().trim();
    const isAi = searchParams?.ai === "true";

    if (isAi) {
      // AI search: the AI extracted ingredient names (comma-separated).
      // All ingredients (store + pantry) are in q. We classify on the server side.
      isAiSearch = true;
      const isRecipe = searchParams?.recipe === "true";
      isRecipeSearch = isRecipe;

      const stem = (w: string) => {
        if (w.endsWith("ies")) return w.slice(0, -3) + "y";
        if (w.endsWith("ves")) return w.slice(0, -3) + "f";
        if (w.endsWith("es")) return w.slice(0, -2);
        if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
        return w;
      };

      const rawTerms = ql
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // In recipe mode, pre-filter pantry items BEFORE DB matching to avoid
      // false matches (e.g., "water" matching nothing)
      let termsToMatch = rawTerms;
      if (isRecipe) {
        const prePantry: string[] = [];
        termsToMatch = rawTerms.filter((t) => {
          const tl = t.toLowerCase();
          if (PANTRY_KEYWORDS.has(tl)) {
            prePantry.push(t);
            return false;
          }
          return true;
        });
        pantryStaples = [...pantryStaples, ...prePantry];
      }

      // For each AI term, try full-term match first; only fall back to
      // individual split-words when the full term finds nothing.
      const nonFoodCats = new Set([
        "personal-care",
        "household",
        "baby-care",
        ...(isRecipe ? ["snacks"] : []),
      ]);

      const foodProducts = isRecipe
        ? displayProducts.filter(
            (p) => !nonFoodCats.has(p.categorySlug?.toLowerCase() ?? ""),
          )
        : displayProducts;

      const matchedIds = new Set<string>();
      const matchedTerms: string[] = [];
      const _unmatchedTerms: string[] = [];

      // Escape special regex chars
      const escRe = (s: string) =>
        s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Build a word-boundary regex allowing common plural suffixes
      const wordRe = (t: string) =>
        new RegExp(`\\b${escRe(t)}(s|es|e)?\\b`, "i");

      for (const term of termsToMatch) {
        const stemmed = stem(term);
        let termFound = false;

        // 1. Try full stemmed term with word boundary
        const fullRe = wordRe(stemmed);
        const fullMatches = foodProducts.filter((p) =>
          fullRe.test(p.name),
        );

        if (fullMatches.length > 0) {
          fullMatches.forEach((p) => matchedIds.add(p.id));
          matchedTerms.push(term);
          continue; // full term found products, skip word splitting
        }

        // 2. Fall back to individual words (min 3 chars after stemming)
        const words = term
          .split(/\s+/)
          .map((w) => stem(w))
          .filter((w) => w.length >= 3);

        // Also try the full stemmed term itself if it's a single word
        if (!term.includes(" ")) words.push(stemmed);

        for (const w of words) {
          const wRe = wordRe(w);
          const wMatches = foodProducts.filter((p) =>
            wRe.test(p.name),
          );
          if (wMatches.length > 0) {
            wMatches.forEach((p) => matchedIds.add(p.id));
            termFound = true;
          }
        }

        if (termFound) matchedTerms.push(term);
        else _unmatchedTerms.push(term);
      }

      unmatchedTerms = _unmatchedTerms;

      // Move any unmatched terms that are pantry staples to the pantry list
      if (isRecipe) {
        const pantryFromUnmatched = unmatchedTerms.filter(
          (t) => PANTRY_KEYWORDS.has(t.toLowerCase()),
        );
        if (pantryFromUnmatched.length > 0) {
          unmatchedTerms = unmatchedTerms.filter(
            (t) => !pantryFromUnmatched.includes(t),
          );
          pantryStaples = [
            ...pantryStaples,
            ...pantryFromUnmatched.filter(
              (t) => !pantryStaples.includes(t),
            ),
          ];
        }
      }

      displayProducts = displayProducts.filter((p) => matchedIds.has(p.id));
    } else {
      // Normal search: try semantic search first, fall back to keyword
      try {
        const { generateEmbedding } = await import(
          "@/lib/embeddings/generate"
        );
        const embedding = await generateEmbedding(ql);

        const { data: matches } = await supabase.rpc("match_products", {
          query_embedding: `[${embedding.join(",")}]`,
          match_threshold: 0.25,
          match_count: 50,
        });

        if (matches && matches.length >= 3) {
          semanticMatches = matches;
        }
      } catch (err) {
        console.error(
          "Semantic search failed, falling back to keyword text search",
          err,
        );
      }

      if (semanticMatches && semanticMatches.length > 0) {
        const scoreMap = new Map(
          semanticMatches.map((m: any) => [m.id, m.similarity]),
        );
        displayProducts = displayProducts
          .filter((p) => scoreMap.has(p.id))
          .sort(
            (a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0),
          );
      } else {
        // Keyword fallback for normal search
        const terms = ql.split(" ").filter(Boolean);
        displayProducts = displayProducts.filter((p) => {
          return terms.some((term) => {
            const nameMatch = p.name.toLowerCase().includes(term);
            const catMatch =
              p.categorySlug && p.categorySlug.toLowerCase().includes(term);
            const brandMatch =
              p.brand && p.brand.toLowerCase().includes(term);
            return nameMatch || catMatch || brandMatch;
          });
        });
      }
    }
  }
  if (categories.length > 0) {
    const catSet = new Set(categories);
    displayProducts = displayProducts.filter(
      (p) => p.categorySlug && catSet.has(p.categorySlug),
    );
  }
  if (maxPrice !== undefined) {
    displayProducts = displayProducts.filter((p) => p.price <= maxPrice);
  }
  if (dietary.length > 0) {
    const dietSet = new Set(dietary);
    displayProducts = displayProducts.filter(
      (p) => p.badge && dietSet.has(p.badge),
    );
  }
  if (brands.length > 0) {
    const brandSet = new Set(brands);
    displayProducts = displayProducts.filter(
      (p) => p.brand && brandSet.has(p.brand),
    );
  }
  if (minRating !== undefined) {
    displayProducts = displayProducts.filter(
      (p) => (p.rating ?? 0) >= minRating,
    );
  }
  if (inStock) {
    displayProducts = displayProducts.filter((p) => (p.stock ?? 1) > 0);
  }
  const totalProducts = displayProducts.length;

  return (
    <div>
      {/* Hero header */}
      <section className="relative section-gradient overflow-hidden py-10 md:py-14">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20" />
        <div className="blob blob-accent w-56 h-56 -bottom-16 -left-16" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Shop</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-1">
                {isRecipeSearch && str(searchParams?.title) ? (
                  <>
                    Ingredients for &ldquo;
                    <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                      {str(searchParams?.title)}
                    </span>
                    &rdquo;
                  </>
                ) : q ? (
                  <>
                    Results for &ldquo;
                    <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                      {searchParams?.ai === "true" ? q.replace(/,/g, ", ") : q}
                    </span>
                    &rdquo;
                  </>
                ) : (
                  <>
                    All{" "}
                    <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                      Products
                    </span>
                  </>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isRecipeSearch
                  ? `We found ${totalProducts} ingredient${totalProducts !== 1 ? "s" : ""} available in our store.`
                  : q
                    ? "Found these products matching your search."
                    : "Discover our complete range of farm-fresh groceries and essentials."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            className="hidden lg:block"
            categoryCounts={categoryCounts}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 bg-background/70 backdrop-blur-sm rounded-xl border border-border/50 px-4 py-3">
              <p className="text-sm text-muted-foreground mr-auto">
                Showing{" "}
                <span className="font-semibold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  {totalProducts}
                </span>{" "}
                {q ? "results" : "products"}
              </p>
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden gap-1.5 rounded-lg border-border/50"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[300px] p-0 flex flex-col sm:max-w-md"
                  >
                    <SheetHeader className="px-5 py-4 border-b border-border/50 text-left">
                      <SheetTitle className="text-lg font-bold">
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-5 py-2">
                      <FilterSidebar
                        className="w-full border-none shadow-none bg-transparent"
                        categoryCounts={categoryCounts}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <SortDropdown />
              </div>
            </div>
            {/* Missing ingredients box for AI recipe search */}
            {isAiSearch && unmatchedTerms.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-950/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Some ingredients are not available yet
                    </h3>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mb-3">
                      These products will be available soon. We&apos;re always adding new items!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {unmatchedTerms.map((term) => (
                        <span
                          key={term}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100/80 dark:bg-amber-900/30 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-600/30"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pantry staples section for recipe search */}
            {isRecipeSearch && pantryStaples.length > 0 && (
              <div className="mb-6 rounded-xl border border-sky-200/60 bg-sky-50/50 dark:border-sky-500/20 dark:bg-sky-950/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center shrink-0">
                    <span className="text-lg">🏠</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-sky-800 dark:text-sky-300 mb-1">
                      Pantry staples you&apos;ll also need
                    </h3>
                    <p className="text-xs text-sky-600/80 dark:text-sky-400/70 mb-3">
                      Common items you probably already have at home
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pantryStaples.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-sky-100/80 dark:bg-sky-900/30 text-xs font-medium text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-600/30"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ProductGrid
              products={displayProducts}
              searchQuery={q && !searchParams?.ai ? q : undefined}
              sortBy={sort}
              categories={categories}
              maxPrice={maxPrice}
              dietary={dietary}
              minRating={minRating}
              brands={brands}
              inStock={inStock}
              page={page}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
