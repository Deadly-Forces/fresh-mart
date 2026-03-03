import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  unit?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  appliedPromo: {
    code: string;
    discountAmount: number;
    discountType?: string;
    originalDiscountValue?: number;
    minOrderValue?: number;
  } | null;
  applyPromo: (promo: {
    code: string;
    discountAmount: number;
    discountType?: string;
    originalDiscountValue?: number;
    minOrderValue?: number;
  }) => void;
  removePromo: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedPromo: null,

      addItem: (item) => {
        const existing = get().items.find(
          (i) =>
            i.productId === item.productId && i.variantId === item.variantId,
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, id: crypto.randomUUID() }],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      applyPromo: (promo) => set({ appliedPromo: promo }),
      removePromo: () => set({ appliedPromo: null }),
    }),
    {
      name: "freshmart-cart",
    },
  ),
);
