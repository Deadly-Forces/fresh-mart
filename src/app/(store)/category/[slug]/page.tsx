import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FilterSidebar } from "@/features/filters/components/FilterSidebar";
import { SortDropdown } from "@/features/filters/components/SortDropdown";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { AllMockProducts, getCategoryCounts } from "@/features/products/utils/mock-data";

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
    const maxPriceRaw = str(searchParamsObj?.maxPrice);
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
    const ratingRaw = str(searchParamsObj?.rating);
    const minRating = ratingRaw ? Math.min(...ratingRaw.split(",").map(Number)) : undefined;

    const pageRaw = str(searchParamsObj?.page);
    const page = pageRaw ? parseInt(pageRaw, 10) : 1;

    const categoryName = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    /* Count the products that will be shown (approximate for display) */
    let displayProducts = AllMockProducts;
    if (slug !== "all") {
        displayProducts = displayProducts.filter(p => !p.categorySlug || p.categorySlug === slug);
    }
    if (categories.length > 0) {
        const catSet = new Set(categories);
        displayProducts = displayProducts.filter((p) => p.categorySlug && catSet.has(p.categorySlug));
    }
    if (maxPrice !== undefined) {
        displayProducts = displayProducts.filter((p) => p.price <= maxPrice);
    }
    if (dietary.length > 0) {
        const dietSet = new Set(dietary);
        displayProducts = displayProducts.filter((p) => p.badge && dietSet.has(p.badge));
    }
    if (minRating !== undefined) {
        displayProducts = displayProducts.filter((p) => (p.rating ?? 0) >= minRating);
    }
    const totalProducts = displayProducts.length;
    const categoryCounts = getCategoryCounts();

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



            <div className="flex gap-8">
                {/* Filter Sidebar */}
                <FilterSidebar className="hidden lg:block" categoryCounts={categoryCounts} />

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{totalProducts}</span>{" "}
                            products
                        </p>
                        <SortDropdown />
                    </div>

                    {/* Product Grid */}
                    <ProductGrid
                        sortBy={sort}
                        categorySlug={slug}
                        categories={categories}
                        maxPrice={maxPrice}
                        dietary={dietary}
                        minRating={minRating}
                        page={page}
                    />
                </div>
            </div>
        </div>
    );
}
