import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBar } from "@/features/home/components/TrustBar";
import { CategoryGrid } from "@/features/home/components/CategoryGrid";
import { ProductCard } from "@/features/products/components/ProductCard";
import { PopularSearches } from "@/features/home/components/PopularSearches";
import { HeroBackground } from "@/features/home/components/HeroBackground";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
    const supabase = await createClient();

    // Fetch 8 featured products
    const { data: featuredData } = await supabase
        .from("products")
        .select("id, name, slug, price, compare_price, images, unit, stock, categories(slug)")
        .eq("is_active", true)
        .limit(8);

    const featuredProducts = (featuredData || []).map((p: any) => {
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
            unit: p.unit,
            categorySlug: catSlug,
            stock: p.stock,
            brand: p.brand || "",
            badge: p.tags?.[0] || "",
            rating: 4.0
        };
    });

    return (
        <div className="overflow-x-hidden">
            {/* ─── Hero Section ─── */}
            <section className="relative w-full pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden section-gradient">
                {/* Animated background */}
                <HeroBackground />

                {/* Decorative background elements */}
                <div className="blob blob-primary w-[500px] h-[500px] -top-40 -right-40 animate-pulse-soft" />
                <div className="blob blob-accent w-[400px] h-[400px] -bottom-20 -left-32 animate-pulse-soft delay-200" />

                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Content */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-7 max-w-xl mx-auto lg:mx-0 animate-fade-in-up">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide border border-primary/15">
                                <Sparkles className="w-3.5 h-3.5" /> Premium Organic Groceries
                            </span>

                            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground">
                                Fresh groceries,<br />
                                <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">delivered daily.</span>
                            </h1>

                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-[440px]">
                                Farm-fresh produce hand-picked and delivered to your doorstep. Quality you can taste, convenience you can count on.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
                                <Link href="/category/all" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold text-sm shadow-glow group">
                                        Start Shopping
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/shop" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold text-sm border-border/80 hover:border-primary/30 hover:bg-primary/5">
                                        Browse Deals
                                    </Button>
                                </Link>
                            </div>

                            {/* Social proof */}
                            <div className="flex items-center gap-3 pt-2 opacity-70">
                                <div className="flex -space-x-2">
                                    {[
                                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                                        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
                                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                                    ].map((src, i) => (
                                        <div key={i} className="relative w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                                            <Image
                                                src={src}
                                                alt="Customer"
                                                fill
                                                className="object-cover"
                                                sizes="32px"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">2,500+</span> happy customers
                                </p>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative w-full max-w-lg mx-auto lg:max-w-none animate-fade-in-up delay-200">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-transparent to-emerald-200/20 dark:to-emerald-800/10 rounded-[2rem] blur-2xl" />
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-aesthetic border border-white/40 dark:border-white/5">
                                <Image
                                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
                                    alt="Fresh groceries"
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Trust Bar ─── */}
            <TrustBar />

            {/* ─── Categories Grid ─── */}
            <CategoryGrid />

            {/* ─── Featured Products ─── */}
            <section className="py-16 md:py-24 section-soft">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="mb-10 flex items-end justify-between gap-4">
                        <div>
                            <span className="inline-block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Curated for You</span>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Today&apos;s Picks</h2>
                        </div>
                        <Link href="/shop" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group shrink-0">
                            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="min-w-[220px] md:min-w-[260px] snap-start">
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Promo Banner ─── */}
            <section className="py-8 container mx-auto px-4 max-w-7xl">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-emerald-500 to-teal-500 p-8 md:p-14 text-white animate-gradient-x">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 text-center md:text-left">
                            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-white/80 mb-3">
                                Limited Time Offer
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                Get 20% off your first order
                            </h2>
                            <p className="text-white/80 text-base mb-1 max-w-md">
                                Use code <span className="font-bold bg-white/15 px-2 py-0.5 rounded-lg text-white">FRESH20</span> at checkout and start saving on fresh groceries.
                            </p>
                        </div>
                        <Link href="/shop" className="shrink-0">
                            <Button size="lg" className="bg-white text-primary hover:bg-white/95 h-12 px-8 text-sm font-bold rounded-xl shadow-lg group">
                                Claim Offer
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Why Fresh Mart ─── */}
            <section className="py-20 md:py-28 section-gradient">
                <div className="container mx-auto px-4 max-w-7xl text-center relative z-10">
                    <span className="inline-block text-xs font-semibold text-primary uppercase tracking-wider mb-3">Why Choose Us</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-3">Why FreshMart?</h2>
                    <p className="text-muted-foreground text-base max-w-md mx-auto mb-14">We&apos;re your partner in healthy, sustainable living.</p>

                    <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { icon: Leaf, title: "Farm to Table", desc: "Sourced directly from local farms within 50 miles. Maximum freshness, minimum carbon footprint.", color: "from-emerald-500/10 to-green-500/5" },
                            { icon: Truck, title: "Lightning Fast", desc: "Order in seconds, delivered in minutes. Smart logistics ensure your groceries arrive fresh.", color: "from-blue-500/10 to-cyan-500/5" },
                            { icon: ShieldCheck, title: "Best Prices", desc: "No middlemen means better prices. Plus exclusive deals and rewards for loyal customers.", color: "from-amber-500/10 to-orange-500/5" },
                        ].map((item, i) => (
                            <div key={i} className="card-aesthetic p-8 text-center group">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-primary mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* ─── Popular Searches ─── */}
            <PopularSearches />
        </div>
    );
}
