"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import {
  ChevronRight,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProductCard } from "./ProductCard";

interface RelatedProduct {
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
}

export function ProductDetailClient({
  product,
  relatedProducts = [],
}: {
  product: any;
  relatedProducts?: RelatedProduct[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState("2");
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const sparkleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hydration check
  useEffect(() => {
    setMounted(true);
    return () => {
      if (sparkleTimeoutRef.current) clearTimeout(sparkleTimeoutRef.current);
    };
  }, []);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const isLiked = mounted && product ? isInWishlist(product.id) : false;

  if (!product) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-24 text-center">
        <h1 className="font-heading text-3xl mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/shop" className="text-primary hover:underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants?.find(
    (v: any) => v.id === selectedVariant,
  ) || { price: product.price, name: "Regular" };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: `${product.name} (${currentVariant.name})`,
      price: currentVariant.price,
      image: product.images[0],
      quantity: quantity,
      unit: product.unit,
    });
    toast.success(
      `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart!`,
    );
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const wasLiked = isLiked;
    toggleItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentVariant.price,
      comparePrice: product.comparePrice,
      image: product.images[0],
      unit: product.unit,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      badge: product.badge,
    });

    // Trigger sparkle animation when adding to wishlist
    if (!wasLiked) {
      setShowSparkle(true);
      if (sparkleTimeoutRef.current) clearTimeout(sparkleTimeoutRef.current);
      sparkleTimeoutRef.current = setTimeout(() => setShowSparkle(false), 700);
    }

    toast.success(
      wasLiked
        ? `Removed ${product.name} from wishlist`
        : `Added ${product.name} to wishlist`,
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-primary transition-colors"
        >
          {product.categoryLabel}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-10 mb-16">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-[52%]">
          <div className="relative aspect-square bg-gradient-to-br from-secondary/60 to-background rounded-[32px] overflow-hidden mb-4 border border-border/50 shadow-sm flex items-center justify-center p-8 group">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain p-12 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.25,0.46,0.45,0.94)]"
              sizes="(max-width: 1024px) 100vw, 52vw"
              priority
            />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                className={`w-20 h-20 shrink-0 rounded-button border-2 overflow-hidden transition-colors ${
                  selectedImage === i
                    ? "border-primary"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedImage(i)}
                title={`View image ${i + 1}`}
                aria-label={`View product image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt=""
                  width={80}
                  height={80}
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info (sticky) */}
        <div className="w-full lg:w-[48%] lg:sticky lg:top-[120px] lg:self-start pl-0 lg:pl-6">
          <h1 className="font-heading text-3xl md:text-[42px] leading-[1.1] text-foreground mb-4 tracking-tight drop-shadow-sm">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating ?? 0) ? "fill-warning text-warning" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating ?? 0}</span>
            <Link
              href="#reviews"
              className="text-sm text-primary hover:underline"
            >
              ({product.reviewsCount} reviews)
            </Link>
          </div>

          {/* Price */}
          <div className="mb-6">
            <PriceDisplay
              price={currentVariant.price}
              comparePrice={product.comparePrice}
              size="lg"
            />
          </div>

          {/* Variants */}
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className={`px-4 py-2 rounded-pill text-sm font-medium border-2 transition-all ${
                    selectedVariant === v.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {v.name} — ₹{v.price.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <p className="text-sm text-success font-medium mb-6 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            In Stock ({product.stock} available)
          </p>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border-2 border-primary/20 hover:border-primary/50 transition-colors rounded-pill h-12 px-2 bg-background/50 backdrop-blur-sm shadow-sm w-[130px]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-primary rounded-full hover:bg-primary/10 transition-colors"
                title="Decrease quantity"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-base w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                className="w-9 h-9 flex items-center justify-center text-primary rounded-full hover:bg-primary/10 transition-colors"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1 h-12 text-[15px] font-bold shadow-glow hover:-translate-y-0.5 transition-all duration-300 rounded-pill"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleWishlist}
              className={cn(
                "h-12 w-12 shrink-0 rounded-full border-2 transition-all duration-300 shadow-sm relative overflow-visible",
                isLiked
                  ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                  : "hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30",
              )}
              title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isLiked && "fill-current",
                  showSparkle && "animate-heart-pop",
                )}
              />
              {/* Sparkle effects */}
              {showSparkle && (
                <>
                  <span className="wishlist-sparkle" />
                  <span className="wishlist-sparkle-ring" />
                  <Sparkles className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-400 animate-ping" />
                  <Sparkles
                    className="absolute -bottom-1 -left-1 w-3 h-3 text-red-400 animate-ping"
                    style={{ animationDelay: "100ms" }}
                  />
                </>
              )}
            </Button>
          </div>

          {/* Delivery Estimator */}
          <div className="bg-gradient-to-br from-secondary/40 to-background rounded-2xl p-5 space-y-4 border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5 text-sm relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-[13px] text-foreground tracking-tight">
                  Free Delivery
                </p>
                <p className="text-muted-foreground text-[12px] font-medium mt-0.5">
                  Estimated delivery: Tomorrow, 9 AM – 12 PM
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 text-sm relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-[13px] text-foreground tracking-tight">
                  Freshness Guarantee
                </p>
                <p className="text-muted-foreground text-[12px] font-medium mt-0.5">
                  Full refund if not satisfied with freshness
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {product.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-primary-muted text-primary text-xs font-medium px-3 py-1 rounded-pill capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description / Nutrition / Reviews */}
      <Tabs
        defaultValue="description"
        className="mb-16 max-w-full overflow-hidden"
      >
        <TabsList className="bg-secondary/50 h-14 md:h-12 p-1.5 rounded-card mb-8 w-full flex justify-start overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <TabsTrigger
            value="description"
            className="data-[state=active]:bg-card rounded-button h-full px-4 md:px-6 text-[13px] md:text-sm font-medium shrink-0 snap-start"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="nutrition"
            className="data-[state=active]:bg-card rounded-button h-full px-4 md:px-6 text-[13px] md:text-sm font-medium shrink-0 snap-start"
          >
            Nutritional Info
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:bg-card rounded-button h-full px-4 md:px-6 text-[13px] md:text-sm font-medium shrink-0 snap-start"
          >
            Reviews ({product.reviewsCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <div
            className="prose prose-sm max-w-none text-foreground/80"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(product.description || ""),
            }}
          />
        </TabsContent>

        <TabsContent value="nutrition">
          <div
            className="prose prose-sm max-w-none text-foreground/80"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(product.nutritionalInfo || ""),
            }}
          />
        </TabsContent>

        <TabsContent value="reviews" id="reviews">
          <ReviewsSection productId={product.id} />
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl md:text-3xl mb-6">
            You May Also Like
          </h2>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {relatedProducts.map((rp) => (
              <div
                key={rp.id}
                className="min-w-[180px] md:min-w-[220px] shrink-0 snap-start"
              >
                <ProductCard
                  id={rp.id}
                  name={rp.name}
                  slug={rp.slug}
                  price={rp.price}
                  comparePrice={rp.comparePrice}
                  image={rp.image}
                  unit={rp.unit}
                  rating={rp.rating}
                  reviewsCount={rp.reviewsCount}
                  badge={rp.badge}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
