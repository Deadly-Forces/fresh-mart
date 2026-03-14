"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import { useHydrated } from "@/hooks/useHydrated";

export function WishlistButton() {
  const items = useWishlistStore((state) => state.items);
  const hydrated = useHydrated();

  const itemCount = items.length;

  return (
    <Link
      href="/wishlist"
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary transition-colors"
      aria-label="Wishlist"
    >
      <Heart className="w-5 h-5 text-red-500" />

      {hydrated && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-background">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
