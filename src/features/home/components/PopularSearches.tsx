import Link from "next/link";
import { AllMockProducts } from "@/features/products/utils/mock-data";

export function PopularSearches() {
    // 1. Get 30 random products, seeded by current date
    const todaySeed = new Date().toISOString().split("T")[0];

    // Simple seeded random function
    const seededRandom = (seedStr: string, index: number) => {
        let hash = 0;
        const str = seedStr + index;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    };

    // Get unique indices to avoid duplicate products
    const uniqueIndices = new Set<number>();
    let attempts = 0;
    while (uniqueIndices.size < 30 && attempts < 100) {
        const randomIndex = Math.floor(seededRandom(todaySeed, attempts) * AllMockProducts.length);
        uniqueIndices.add(randomIndex);
        attempts++;
    }

    const popularProducts = Array.from(uniqueIndices).map((index) => AllMockProducts[index]);

    // 3. Categories List
    const categoryLinks = [
        { name: "Vegetables", slug: "vegetables" },
        { name: "Fruits", slug: "fruits" },
        { name: "Dairy & Eggs", slug: "dairy-eggs" },
        { name: "Bakery", slug: "bakery" },
        { name: "Meat & Seafood", slug: "meat-seafood" },
        { name: "Snacks", slug: "snacks" },
        { name: "Beverages", slug: "beverages" },
        { name: "Personal Care", slug: "personal-care" },
        { name: "Household", slug: "household" },
        { name: "Baby Care", slug: "baby-care" },
    ];

    const categoryGridLeft = [
        { name: "Fresh Produce", desc: "Farm to table organics", slug: "vegetables" },
        { name: "Dairy & Eggs", desc: "Daily essentials", slug: "dairy-eggs" },
        { name: "Meat & Seafood", desc: "Premium quality cuts", slug: "meat-seafood" },
        { name: "Artisan Bakery", desc: "Baked fresh every morning", slug: "bakery" },
        { name: "Pantry Staples", desc: "Stock your kitchen", slug: "pantry" },
    ];

    const categoryGridRight = [
        { name: "Snacks & Munchies", desc: "Satisfy your cravings", slug: "snacks" },
        { name: "Beverages", desc: "Quench your thirst", slug: "beverages" },
        { name: "Frozen Foods", desc: "Convenient meals & treats", slug: "frozen" },
        { name: "Personal Care", desc: "Health & beauty essentials", slug: "personal-care" },
        { name: "Household Cleaning", desc: "Keep your home sparkling", slug: "household" },
    ];

    return (
        <section className="py-16 md:py-24 border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-12">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight mb-8">
                        Popular Searches
                    </h2>

                    <div className="flex flex-col gap-6">
                        {/* Products Row */}
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                            <span className="font-semibold text-sm text-foreground shrink-0 w-24">Products:</span>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                {popularProducts.map((product, index) => (
                                    <span key={product.id}>
                                        <Link
                                            href={`/product/${product.slug}`}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {product.name}
                                        </Link>
                                        {index < popularProducts.length - 1 && <span className="mx-1.5 text-border">|</span>}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Categories Row */}
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                            <span className="font-semibold text-sm text-foreground shrink-0 w-24">Categories:</span>
                            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                {categoryLinks.map((cat, index) => (
                                    <span key={cat.slug}>
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                        {index < categoryLinks.length - 1 && <span className="mx-1.5 text-border">|</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Grid (Bottom Section) */}
                <div className="pt-12 border-t border-border/40">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight mb-8">
                        Categories
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Left Column */}
                        <div className="flex flex-col gap-5">
                            {categoryGridLeft.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/category/${cat.slug}`}
                                    className="group flex flex-col"
                                >
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-5">
                            {categoryGridRight.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/category/${cat.slug}`}
                                    className="group flex flex-col"
                                >
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
