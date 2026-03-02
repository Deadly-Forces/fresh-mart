import { fetchProductBySlug } from "@/lib/supabase/products";
import { ProductDetailClient } from "@/features/products/components/ProductDetailClient";
import Link from "next/link";

/** Build derived detail fields from a base product */
function buildDetail(base: NonNullable<Awaited<ReturnType<typeof fetchProductBySlug>>>) {
    const categoryLabel =
        base.categorySlug
            ? base.categorySlug.charAt(0).toUpperCase() + base.categorySlug.slice(1)
            : "Grocery";

    const tagOptions: Record<string, string[]> = {
        vegetables: ["organic", "vegan", "gluten-free"],
        fruits: ["organic", "vegan", "gluten-free"],
        dairy: ["dairy", "calcium-rich", "refrigerated"],
        bakery: ["baked-fresh", "wheat", "preservative-free"],
        beverages: ["refreshing", "no-preservatives", "hydrating"],
        snacks: ["crunchy", "family-size", "party-ready"],
        meat: ["protein-rich", "fresh-cut", "hormone-free"],
        seafood: ["omega-3", "wild-caught", "fresh"],
        frozen: ["quick-prep", "frozen-fresh", "value-pack"],
        pantry: ["shelf-stable", "essential", "value"],
        organic: ["organic", "non-gmo", "sustainable"],
        "health-wellness": ["wellness", "supplement", "natural"],
    };

    const tags = tagOptions[base.categorySlug ?? ""] ?? ["fresh", "quality", "value"];

    const basePrice = base.price;
    const variants = [
        { id: "1", name: "Small Pack", price: Math.round(basePrice * 0.75 * 100) / 100 },
        { id: "2", name: "Regular", price: basePrice },
        { id: "3", name: "Family Size", price: Math.round(basePrice * 1.6 * 100) / 100 },
    ];

    return {
        ...base,
        images: [base.image, base.image, base.image, base.image, base.image],
        stock: base.stock ?? 50,
        description: `<p>${base.name} — premium quality from trusted suppliers. Selected for freshness and flavour so you can enjoy the very best.</p><ul><li>Premium quality guaranteed</li><li>Carefully selected &amp; inspected</li><li>From trusted suppliers</li><li>Great value for money</li></ul>`,
        nutritionalInfo: `<table><tr><td>Serving Size</td><td>100 g</td></tr><tr><td>Calories</td><td>${90 + ((base.price * 10) | 0)}</td></tr><tr><td>Total Fat</td><td>${(base.price * 0.3).toFixed(1)}g</td></tr><tr><td>Sodium</td><td>${(base.price * 5).toFixed(0)}mg</td></tr><tr><td>Carbohydrate</td><td>${(base.price * 2).toFixed(0)}g</td></tr><tr><td>Protein</td><td>${(base.price * 0.8).toFixed(1)}g</td></tr></table>`,
        tags,
        variants,
        categorySlug: base.categorySlug ?? "grocery",
        categoryLabel,
    };
}


export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const base = await fetchProductBySlug(slug);
    const product = base ? buildDetail(base) : null;

    if (!product) {
        return (
            <div className="container mx-auto px-4 max-w-7xl py-24 text-center">
                <h1 className="font-heading text-3xl mb-4">Product Not Found</h1>
                <p className="text-muted-foreground mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/shop" className="text-primary hover:underline">← Back to Shop</Link>
            </div>
        );
    }

    return <ProductDetailClient product={product} />;
}
