import { ProductCard } from "@/features/products/components/ProductCard";

interface ProductGridProps {
    products?: {
        id: string;
        name: string;
        slug: string;
        price: number;
        comparePrice?: number;
        image: string;
        unit?: string;
        rating?: number;
        reviewsCount?: number;
        badge?: string;
        categorySlug?: string;
        brand?: string;
        stock?: number;
    }[];
    sortBy?: string;
    categorySlug?: string;
    searchQuery?: string;
    categories?: string[];
    maxPrice?: number;
    dietary?: string[];
    minRating?: number;
    brands?: string[];
    inStock?: boolean;
    page?: number;
}

import { ProductPagination } from "./ProductPagination";

export function ProductGrid({
    products = [],
    sortBy = "relevance",
    categorySlug,
    searchQuery,
    categories,
    maxPrice,
    dietary,
    minRating,
    brands,
    inStock,
    page = 1,
}: ProductGridProps) {
    let filteredProducts = [...products];

    // Legacy single-category filter (kept for category/[slug] pages)
    if (categorySlug && categorySlug !== "all") {
        filteredProducts = filteredProducts.filter(
            (p) => p.categorySlug === categorySlug,
        );
    }

    // Multi-category filter from sidebar
    if (categories && categories.length > 0) {
        const catSet = new Set(categories);
        filteredProducts = filteredProducts.filter(
            (p) => p.categorySlug && catSet.has(p.categorySlug),
        );
    }

    // Search query
    if (searchQuery) {
        let queryStr = searchQuery.toLowerCase().trim();
        // Remove trailing 's' for simple plural matching (e.g., "apples" -> "apple")
        if (queryStr.endsWith("s") && queryStr.length > 3) {
            queryStr = queryStr.slice(0, -1);
        }
        filteredProducts = filteredProducts.filter((p) => {
            const nameMatch = p.name.toLowerCase().includes(queryStr);
            const catMatch = p.categorySlug && p.categorySlug.toLowerCase().includes(queryStr);
            const brandMatch = p.brand && p.brand.toLowerCase().includes(queryStr);
            return nameMatch || catMatch || brandMatch;
        });
    }

    // Max price
    if (maxPrice !== undefined && maxPrice > 0) {
        filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);
    }

    // Dietary / badge filter
    if (dietary && dietary.length > 0) {
        const dietSet = new Set(dietary);
        filteredProducts = filteredProducts.filter(
            (p) => p.badge && dietSet.has(p.badge),
        );
    }

    // Minimum rating
    if (minRating !== undefined && minRating > 0) {
        filteredProducts = filteredProducts.filter(
            (p) => (p.rating ?? 0) >= minRating,
        );
    }

    // Brands
    if (brands && brands.length > 0) {
        const brandSet = new Set(brands);
        filteredProducts = filteredProducts.filter(
            (p) => p.brand && brandSet.has(p.brand),
        );
    }

    // In Stock
    if (inStock) {
        filteredProducts = filteredProducts.filter(
            (p) => (p.stock ?? 1) > 0,
        );
    }

    // Sort
    const sortedProducts = filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case "price_asc":
                return a.price - b.price;
            case "price_desc":
                return b.price - a.price;
            case "newest":
                return b.id.localeCompare(a.id);
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "relevance":
            default:
                return 0;
        }
    });

    if (sortedProducts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
        );
    }

    const pageSize = 24;
    const totalPages = Math.ceil(sortedProducts.length / pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const displayProducts = sortedProducts.slice(startIndex, endIndex);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        comparePrice={product.comparePrice}
                        image={product.image}
                        unit={product.unit}
                        rating={product.rating}
                        reviewsCount={product.reviewsCount}
                        badge={product.badge}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <ProductPagination totalPages={totalPages} currentPage={validPage} />
            )}
        </div>
    );
}
