import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistProduct {
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

interface WishlistState {
  items: WishlistProduct[];
  addItem: (product: WishlistProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: WishlistProduct) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) return state;
          return { items: [...state.items, product] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      toggleItem: (product) => {
        const { isInWishlist, removeItem, addItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (productId) =>
        get().items.some((item) => item.id === productId),
    }),
    {
      name: "fresh-mart-wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
