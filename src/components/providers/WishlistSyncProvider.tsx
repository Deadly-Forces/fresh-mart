"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";

/**
 * Syncs the Zustand wishlist store with the server-side wishlist table
 * for logged-in users. Renders nothing — just runs side-effects.
 */
export function WishlistSyncProvider() {
  useEffect(() => {
    const supabase = createClient();
    const { setAuthenticated } = useWishlistStore.getState();

    // ── Auth listener ─────────────────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
        session?.user
      ) {
        await setAuthenticated(true);
      } else if (event === "SIGNED_OUT") {
        setAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
