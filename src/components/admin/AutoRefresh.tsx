"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AutoRefreshProps {
  /** Fallback polling interval in ms (default 30s) */
  intervalMs?: number;
  /** Supabase tables to subscribe to for realtime changes */
  tables?: string[];
  /** Debounce delay in ms for realtime-triggered refreshes (default 2s) */
  debounceMs?: number;
}

/**
 * Listens to Supabase Realtime changes on specified tables and triggers
 * a Next.js router.refresh() to re-fetch server component data.
 * Falls back to polling if realtime is unavailable.
 * Debounces rapid-fire events to prevent fetch floods.
 */
export function AutoRefresh({
  intervalMs = 30000,
  tables = [
    "orders",
    "products",
    "categories",
    "profiles",
    "coupons",
    "banners",
  ],
  debounceMs = 2000,
}: AutoRefreshProps) {
  const router = useRouter();
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInFlight = useRef(false);

  // Set initial time only on mount to avoid hydration mismatch
  useEffect(() => {
    setLastSynced(new Date());
  }, []);

  const doRefresh = useCallback(() => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    try {
      router.refresh();
      setLastSynced(new Date());
    } catch {
      // Swallow fetch errors from router.refresh()
    } finally {
      // Allow next refresh after a short cooldown
      setTimeout(() => {
        refreshInFlight.current = false;
      }, 1000);
    }
  }, [router]);

  // Debounced version for realtime events
  const debouncedRefresh = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      doRefresh();
      debounceTimer.current = null;
    }, debounceMs);
  }, [doRefresh, debounceMs]);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `admin-sync-${tables.join("-")}`;

    // Subscribe to realtime changes on all specified tables
    const channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        () => {
          debouncedRefresh();
        },
      );
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setRealtimeConnected(true);
      } else {
        setRealtimeConnected(false);
      }
    });

    // Fallback polling (less frequent since realtime handles most updates)
    const interval = setInterval(() => {
      doRefresh();
    }, intervalMs);

    return () => {
      clearInterval(interval);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      supabase.removeChannel(channel);
    };
  }, [doRefresh, debouncedRefresh, intervalMs, tables]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground mr-4">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
      </span>
      <span>
        {realtimeConnected ? "Live" : "Polling"} Sync Active
        {lastSynced ? ` (Updated: ${lastSynced.toLocaleTimeString()})` : ""}
      </span>
    </div>
  );
}
