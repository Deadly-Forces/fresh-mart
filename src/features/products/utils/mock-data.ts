import productsData from "./products.json";

export interface Product {
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
}

export const AllMockProducts: Product[] = productsData as Product[];

export function getCategoryCounts(): Record<string, number> {
    const categoryCounts: Record<string, number> = {};
    AllMockProducts.forEach((p) => {
        const cat = p.categorySlug ?? "other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    return categoryCounts;
}
