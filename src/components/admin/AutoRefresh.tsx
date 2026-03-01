"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AutoRefreshProps {
    /** Fallback polling interval in ms (default 30s) */
    intervalMs?: number;
    /** Supabase tables to subscribe to for realtime changes */
    tables?: string[];
}

/**
 * Listens to Supabase Realtime changes on specified tables and triggers
 * a Next.js router.refresh() to re-fetch server component data.
 * Falls back to polling if realtime is unavailable.
 */
export function AutoRefresh({
    intervalMs = 30000,
    tables = ["orders", "products", "categories", "profiles", "coupons", "banners"],
}: AutoRefreshProps) {
    const router = useRouter();
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [realtimeConnected, setRealtimeConnected] = useState(false);

    // Set initial time only on mount to avoid hydration mismatch
    useEffect(() => {
        setLastSynced(new Date());
    }, []);

    const doRefresh = useCallback(() => {
        router.refresh();
        setLastSynced(new Date());
    }, [router]);

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
                    doRefresh();
                }
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
            supabase.removeChannel(channel);
        };
    }, [doRefresh, intervalMs, tables]);

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mr-4">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span>
                {realtimeConnected ? "Live" : "Polling"} Sync Active{lastSynced ? ` (Updated: ${lastSynced.toLocaleTimeString()})` : ""}
            </span>
        </div>
    );
}
