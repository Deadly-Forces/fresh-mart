"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Minus, Plus, Heart, Sparkles } from "lucide-react";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";

interface ProductCardProps {
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
  className?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  unit,
  rating = 4.5,
  reviewsCount = 12,
  badge,
  className,
}: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const sparkleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (sparkleTimeoutRef.current) clearTimeout(sparkleTimeoutRef.current);
    };
  }, []);

  const isLiked = mounted ? isInWishlist(id) : false;

  const cartItem = items.find((i) => i.productId === id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link area
    addItem({
      productId: id,
      name,
      price,
      image,
      quantity: 1,
      unit,
    });
    toast.success(`Added ${name} to cart!`);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeItem(cartItem.id);
        toast.success(`Removed ${name} from cart`);
      } else {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      }
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const wasLiked = isLiked;
    toggleItem({
      id,
      name,
      slug,
      price,
      comparePrice,
      image,
      unit,
      rating,
      reviewsCount,
      badge,
    });

    // Trigger sparkle animation when adding to wishlist
    if (!wasLiked) {
      setShowSparkle(true);
      if (sparkleTimeoutRef.current) clearTimeout(sparkleTimeoutRef.current);
      sparkleTimeoutRef.current = setTimeout(() => setShowSparkle(false), 700);
    }

    toast.success(
      wasLiked ? `Removed ${name} from wishlist` : `Added ${name} to wishlist`,
    );
  };

  return (
    <div
      className={cn(
        "group relative bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/15",
        className,
      )}
    >
      {badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gradient-to-r from-primary to-emerald-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide shadow-sm">
            {badge}
          </span>
        </div>
      )}

      <button
        onClick={handleToggleWishlist}
        className={cn(
          "absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:scale-110 active:scale-95 transition-all duration-200",
          isLiked
            ? "border-red-200 bg-red-50/80 dark:bg-red-950/30"
            : "border-border/50",
        )}
        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-all duration-300",
            isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground",
            showSparkle && "animate-heart-pop",
          )}
        />
        {/* Sparkle effects */}
        {showSparkle && (
          <>
            <span className="wishlist-sparkle" />
            <span className="wishlist-sparkle-ring" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-ping" />
            <Sparkles
              className="absolute -bottom-1 -left-1 w-2.5 h-2.5 text-red-400 animate-ping"
              style={{ animationDelay: "100ms" }}
            />
          </>
        )}
      </button>

      <Link
        href={`/product/${slug}`}
        className="block relative aspect-square w-full bg-gradient-to-br from-secondary/40 to-secondary/10 overflow-hidden"
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-6 mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3",
                i < Math.floor(rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted",
              )}
            />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">
            ({reviewsCount})
          </span>
        </div>

        <Link
          href={`/product/${slug}`}
          className="text-sm font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors mb-1"
        >
          {name}
        </Link>

        {unit && (
          <span className="text-xs text-muted-foreground mb-3 block">
            {unit}
          </span>
        )}

        <div className="mt-auto space-y-3">
          <PriceDisplay price={price} comparePrice={comparePrice} size="sm" />

          {mounted && cartItem ? (
            <div className="flex items-center justify-between w-full h-9 rounded-xl border border-primary bg-primary text-primary-foreground overflow-hidden shadow-sm z-10 relative transition-all">
              <button
                onClick={handleDecrement}
                aria-label={`Decrease quantity of ${name}`}
                className="w-10 h-full flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="flex-1 text-center font-bold text-sm">
                {cartItem.quantity}
              </span>
              <button
                onClick={handleIncrement}
                aria-label={`Increase quantity of ${name}`}
                className="w-10 h-full flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              variant="default"
              className="w-full text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-sm hover:shadow-glow transition-shadow z-10 relative"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
