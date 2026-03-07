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
  isAuthenticated: boolean;
  _serverLoaded: boolean;
  addItem: (product: WishlistProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: WishlistProduct) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  /** Call when user logs in — loads server wishlist and merges local items */
  setAuthenticated: (authenticated: boolean) => void;
  /** Force-reload from server */
  loadFromServer: () => Promise<void>;
}

async function apiAddItem(productId: string) {
  await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
}

async function apiRemoveItem(productId: string) {
  await fetch("/api/wishlist", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  });
}

async function apiFetchItems(): Promise<WishlistProduct[]> {
  const res = await fetch("/api/wishlist");
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthenticated: false,
      _serverLoaded: false,

      addItem: (product) => {
        const state = get();
        if (state.items.some((item) => item.id === product.id)) return;
        // Optimistic update
        set({ items: [...state.items, product] });
        // Sync to server
        if (state.isAuthenticated) {
          apiAddItem(product.id);
        }
      },

      removeItem: (productId) => {
        const state = get();
        // Optimistic update
        set({ items: state.items.filter((item) => item.id !== productId) });
        // Sync to server
        if (state.isAuthenticated) {
          apiRemoveItem(productId);
        }
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

      setAuthenticated: async (authenticated) => {
        set({ isAuthenticated: authenticated });
        if (authenticated) {
          // Merge local (guest) items into server, then load server state
          const localItems = get().items;
          // Upload any local-only items
          if (localItems.length > 0) {
            await Promise.all(localItems.map((item) => apiAddItem(item.id)));
          }
          // Load canonical server state
          const serverItems = await apiFetchItems();
          set({ items: serverItems, _serverLoaded: true });
        } else {
          // User logged out — keep local items as-is for guest experience
          set({ _serverLoaded: false });
        }
      },

      loadFromServer: async () => {
        if (!get().isAuthenticated) return;
        const serverItems = await apiFetchItems();
        set({ items: serverItems, _serverLoaded: true });
      },
    }),
    {
      name: "fresh-mart-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
