"use client";

import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";

export default function WishlistPage() {
  const { items } = useWishlistStore();

  return (
    <div className="container mx-auto px-4 max-w-7xl py-10 min-h-[60vh]">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">Wishlist</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
          <Heart className="w-6 h-6 fill-white" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-1">
            Your <span className="text-red-500">Wishlist</span>
          </h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved for
            later
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <ProductGrid products={items} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-secondary/30 rounded-3xl border border-border/50 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            Save items you love so you can easily find them later.
          </p>
          <Link
            href="/shop"
            className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
