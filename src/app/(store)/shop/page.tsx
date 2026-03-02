import Link from "next/link";
import { FilterSidebar } from "@/features/filters/components/FilterSidebar";
import { SortDropdown } from "@/features/filters/components/SortDropdown";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ChevronRight, ShoppingBag, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
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
        .from('products')
        .select('id, name, slug, price, compare_price, images, unit, stock, categories(slug)')
        .eq('is_active', true);

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
        const { data: batch } = await query.range(fetchFrom, fetchFrom + BATCH_SIZE - 1);
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
            rating: 4.0 // Default rating
        };
    });

    // Calculate category counts dynamically
    const categoryCounts: Record<string, number> = {};
    productsList.forEach((p) => {
        const cat = p.categorySlug ?? "other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    /* Count the products that will be shown (approximate for display) */
    let displayProducts = productsList;
    if (q) {
        let ql = q.toLowerCase().trim();
        if (ql.endsWith("s") && ql.length > 3) {
            ql = ql.slice(0, -1);
        }
        displayProducts = displayProducts.filter((p) => {
            const nameMatch = p.name.toLowerCase().includes(ql);
            const catMatch = p.categorySlug && p.categorySlug.toLowerCase().includes(ql);
            const brandMatch = p.brand && p.brand.toLowerCase().includes(ql);
            return nameMatch || catMatch || brandMatch;
        });
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
        displayProducts = displayProducts.filter(
            (p) => (p.stock ?? 1) > 0,
        );
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
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-foreground font-medium">Shop</span>
                    </nav>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-1">
                                {q ? (
                                    <>Results for &ldquo;<span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">{q}</span>&rdquo;</>
                                ) : (
                                    <>All <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Products</span></>
                                )}
                            </h1>
                            <p className="text-muted-foreground">
                                {q ? "Found these products matching your search." : "Discover our complete range of farm-fresh groceries and essentials."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-7xl py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar className="hidden lg:block" categoryCounts={categoryCounts} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-6 bg-background/70 backdrop-blur-sm rounded-xl border border-border/50 px-4 py-3">
                            <p className="text-sm text-muted-foreground mr-auto">
                                Showing <span className="font-semibold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">{totalProducts}</span> {q ? "results" : "products"}
                            </p>
                            <div className="flex items-center gap-3">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="lg:hidden gap-1.5 rounded-lg border-border/50">
                                            <Filter className="w-4 h-4" />
                                            Filters
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[300px] p-0 flex flex-col sm:max-w-md">
                                        <SheetHeader className="px-5 py-4 border-b border-border/50 text-left">
                                            <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
                                        </SheetHeader>
                                        <div className="flex-1 overflow-y-auto px-5 py-2">
                                            <FilterSidebar className="w-full border-none shadow-none bg-transparent" categoryCounts={categoryCounts} />
                                        </div>
                                    </SheetContent>
                                </Sheet>
                                <SortDropdown />
                            </div>
                        </div>
                        <ProductGrid
                            products={displayProducts}
                            searchQuery={q}
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
