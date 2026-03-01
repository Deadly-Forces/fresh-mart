"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function CategoryGrid() {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            const supabase = createClient();
            const { data } = await supabase
                .from("categories")
                .select("*")
                .order("sort_order", { ascending: true })
                .limit(5);

            if (data) {
                // Map the default images for the first 5 categories specifically for aesthetic purposes
                const mapped = data.map((c, i) => {
                    const fallbackImages = [
                        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=1200&q=80",
                        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
                        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80",
                        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80"
                    ];
                    return {
                        ...c,
                        image: c.image_url || fallbackImages[i % fallbackImages.length],
                        desc: "Farm fresh organic selection",
                        span: i === 0 ? "md:col-span-2 md:row-span-2" : ""
                    };
                });
                setCategories(mapped);
            }
        }
        fetchCategories();
    }, []);

    return (
        <section className="py-16 md:py-24 section-soft">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-end justify-between gap-4 mb-10">
                    <div>
                        <span className="inline-block text-xs font-semibold text-primary uppercase tracking-wider mb-2">Browse</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Shop by Category</h2>
                    </div>
                    <Link href="/category/all" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group shrink-0">
                        View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[210px]">
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/category/${category.slug}`}
                            className={`group relative overflow-hidden rounded-3xl block shadow-soft hover:shadow-card-hover transition-all duration-500 ${category.span}`}
                        >
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 group-hover:from-black/70 transition-colors duration-300" />
                            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 transform group-hover:translate-y-0 transition-transform">
                                <h3 className="text-white font-bold text-base md:text-lg leading-tight">{category.name}</h3>
                                <p className="text-white/70 text-xs md:text-sm mt-1 flex items-center gap-1">
                                    {category.desc}
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 flex justify-center md:hidden">
                    <Link href="/category/all" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                        View all categories <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
