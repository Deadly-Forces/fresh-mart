import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";
import { FilterSidebar } from "@/features/filters/components/FilterSidebar";
import { SortDropdown } from "@/features/filters/components/SortDropdown";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { fetchProducts, fetchCategoryCounts } from "@/lib/supabase/products";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const searchParamsObj = await searchParams;

  function str(val: string | string[] | undefined): string | undefined {
    return typeof val === "string" ? val : undefined;
  }

  function strArr(val: string | string[] | undefined): string[] {
    if (!val) return [];
    if (typeof val === "string") return val.split(",").filter(Boolean);
    return val;
  }

  const sort = str(searchParamsObj?.sort) || "relevance";
  const categories = strArr(searchParamsObj?.category);
  const dietary = strArr(searchParamsObj?.dietary);
  const brands = strArr(searchParamsObj?.brand);
  const maxPriceRaw = str(searchParamsObj?.maxPrice);
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
  const ratingRaw = str(searchParamsObj?.rating);
  const minRating = ratingRaw
    ? Math.min(...ratingRaw.split(",").map(Number))
    : undefined;
  const inStock = str(searchParamsObj?.inStock) === "1";

  const pageRaw = str(searchParamsObj?.page);
  const page = pageRaw ? parseInt(pageRaw, 10) : 1;

  const categoryName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  /* Fetch products from Supabase, filtered by category when not "all" */
  const allProducts = await fetchProducts({
    categorySlug: slug !== "all" ? slug : undefined,
  });

  /* Apply additional client-side filters for the display count */
  let displayProducts = allProducts;
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
  if (minRating !== undefined) {
    displayProducts = displayProducts.filter(
      (p) => (p.rating ?? 0) >= minRating,
    );
  }
  if (brands.length > 0) {
    const brandSet = new Set(brands);
    displayProducts = displayProducts.filter(
      (p) => p.brand && brandSet.has(p.brand),
    );
  }
  if (inStock) {
    displayProducts = displayProducts.filter((p) => (p.stock ?? 1) > 0);
  }
  const totalProducts = displayProducts.length;
  const categoryCounts = await fetchCategoryCounts();

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{categoryName}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <FilterSidebar
          className="hidden lg:block"
          categoryCounts={categoryCounts}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 bg-background/70 backdrop-blur-sm rounded-xl border border-border/50 px-4 py-3">
            <p className="text-sm text-muted-foreground mr-auto">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {totalProducts}
              </span>{" "}
              products
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

          {/* Product Grid */}
          <ProductGrid
            products={allProducts}
            sortBy={sort}
            categorySlug={slug}
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
  );
}
