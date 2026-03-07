"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore, type CartItem } from "@/features/cart/store/useCartStore";

/**
 * Syncs the Zustand cart (localStorage) with the server-side cart_items table
 * for logged-in users. Renders nothing — just runs side-effects.
 */
export function CartSyncProvider() {
  const isSyncing = useRef(false);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // ── Fetch server cart (joined with product data) ──────────────
    async function fetchServerCart(uid: string): Promise<CartItem[]> {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          product_id,
          variant_id,
          quantity,
          products!inner(name, price, images, unit),
          product_variants(name, price)
        `,
        )
        .eq("user_id", uid);

      if (error || !data) return [];

      return (data as Record<string, unknown>[]).map((item) => {
        const product = item.products as {
          name: string;
          price: number;
          images: string[] | null;
          unit: string | null;
        };
        const variant = item.product_variants as {
          name: string;
          price: number;
        } | null;

        return {
          id: item.id as string,
          productId: item.product_id as string,
          variantId: (item.variant_id as string) ?? undefined,
          name: variant ? `${product.name} - ${variant.name}` : product.name,
          image: product.images?.[0] ?? "",
          price: variant?.price ?? product.price,
          unit: product.unit ?? undefined,
          quantity: item.quantity as number,
        };
      });
    }

    // ── Replace server cart for user ──────────────────────────────
    async function pushCartToServer(uid: string, items: CartItem[]) {
      await supabase.from("cart_items").delete().eq("user_id", uid);

      if (items.length === 0) return;

      const rows = items.map((item) => ({
        user_id: uid,
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        quantity: item.quantity,
      }));

      await supabase.from("cart_items").insert(rows);
    }

    // ── Merge local + server carts ────────────────────────────────
    function mergeCarts(local: CartItem[], server: CartItem[]): CartItem[] {
      const merged = new Map<string, CartItem>();

      for (const item of server) {
        merged.set(`${item.productId}:${item.variantId ?? ""}`, item);
      }

      for (const item of local) {
        const key = `${item.productId}:${item.variantId ?? ""}`;
        const existing = merged.get(key);
        if (existing) {
          merged.set(key, {
            ...item,
            quantity: Math.max(item.quantity, existing.quantity),
          });
        } else {
          merged.set(key, item);
        }
      }

      return Array.from(merged.values());
    }

    // ── Run on login / mount ──────────────────────────────────────
    async function syncOnLogin(uid: string) {
      if (isSyncing.current) return;
      isSyncing.current = true;

      try {
        const serverCart = await fetchServerCart(uid);
        const localCart = useCartStore.getState().items;

        if (localCart.length === 0 && serverCart.length > 0) {
          useCartStore.getState().setItems(serverCart);
        } else if (localCart.length > 0 && serverCart.length === 0) {
          await pushCartToServer(uid, localCart);
        } else if (localCart.length > 0 && serverCart.length > 0) {
          const merged = mergeCarts(localCart, serverCart);
          useCartStore.getState().setItems(merged);
          await pushCartToServer(uid, merged);
        }
      } finally {
        isSyncing.current = false;
      }
    }

    // ── Auth listener ─────────────────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
        session?.user
      ) {
        userId.current = session.user.id;
        await syncOnLogin(session.user.id);
      } else if (event === "SIGNED_OUT") {
        userId.current = null;
      }
    });

    // ── Debounced push on local cart changes ──────────────────────
    let debounceTimer: ReturnType<typeof setTimeout>;

    const unsubscribe = useCartStore.subscribe((state, prevState) => {
      if (isSyncing.current || !userId.current) return;
      if (state.items === prevState.items) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (userId.current) {
          pushCartToServer(userId.current, state.items);
        }
      }, 1000);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribe();
      clearTimeout(debounceTimer);
    };
  }, []);

  return null;
}
