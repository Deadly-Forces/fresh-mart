import Link from "next/link";
import { FilterSidebar } from "@/features/filters/components/FilterSidebar";
import { SortDropdown } from "@/features/filters/components/SortDropdown";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import { fetchProducts } from "@/lib/supabase/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = params.page ? parseInt(params.page, 10) : 1;

  // Fetch products from DB so ProductGrid doesn't need the 570KB mock import
  const products = query ? await fetchProducts() : [];

  return (
    <div>
      {/* Hero header */}
      <section className="relative section-gradient overflow-hidden py-10 md:py-14">
        <div className="blob blob-primary w-72 h-72 -top-20 -left-20" />
        <div className="blob blob-accent w-56 h-56 -bottom-16 -right-16" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <SearchIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-1">
                {query ? (
                  <>
                    Results for &ldquo;
                    <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                      {query}
                    </span>
                    &rdquo;
                  </>
                ) : (
                  <>
                    Search{" "}
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      Products
                    </span>
                  </>
                )}
              </h1>
              {query && (
                <p className="text-muted-foreground">
                  Showing results for your search
                </p>
              )}
              {!query && (
                <p className="text-muted-foreground">
                  Find exactly what you need from our fresh collection
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex gap-8">
          <FilterSidebar className="hidden lg:block" />
          <div className="flex-1 min-w-0">
            {query && (
              <div className="flex items-center justify-between mb-6 bg-background/70 backdrop-blur-sm rounded-xl border border-border/50 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                    12
                  </span>{" "}
                  results
                </p>
                <SortDropdown />
              </div>
            )}

            {query ? (
              <ProductGrid
                products={products}
                searchQuery={query}
                page={page}
              />
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
                    <SearchIcon className="w-10 h-10 text-blue-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Search for Products</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Type a keyword to search for groceries, fresh produce, and
                  daily essentials.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    {
                      name: "Vegetables",
                      color:
                        "from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
                    },
                    {
                      name: "Fruits",
                      color:
                        "from-orange-500/10 to-amber-500/10 border-orange-500/20 hover:border-orange-500/40 text-orange-700 dark:text-orange-400",
                    },
                    {
                      name: "Dairy",
                      color:
                        "from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 text-blue-700 dark:text-blue-400",
                    },
                    {
                      name: "Snacks",
                      color:
                        "from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 text-purple-700 dark:text-purple-400",
                    },
                  ].map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/category/${cat.name.toLowerCase()}`}
                      className={`px-5 py-2.5 rounded-full bg-gradient-to-r ${cat.color} border text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
