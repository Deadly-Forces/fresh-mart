"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Package,
  Megaphone,
  Info,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";
import { createClient } from "@/lib/supabase/client";

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; label: string; color: string }
> = {
  order_update: {
    icon: Package,
    label: "Order",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
  },
  promo: {
    icon: Megaphone,
    label: "Promo",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-950/40",
  },
  system: {
    icon: Info,
    label: "System",
    color: "text-gray-500 bg-gray-50 dark:bg-gray-950/40",
  },
};

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface NotificationsListProps {
  initialNotifications: Notification[];
}

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();
  const userIdRef = useRef<string | null>(null);

  // ── Realtime subscription: get live notifications without page refresh ──
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      userIdRef.current = user.id;

      channel = supabase
        .channel("notifications-list-live")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newN = payload.new as Notification;
            setNotifications((prev) => [newN, ...prev]);
            // Flag as "new" for animation, clear after 2s
            setNewIds((prev) => new Set(prev).add(newN.id));
            setTimeout(
              () =>
                setNewIds((prev) => {
                  const s = new Set(prev);
                  s.delete(newN.id);
                  return s;
                }),
              2000,
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)),
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "notifications" },
          (payload) => {
            const deleted = payload.old as { id: string };
            setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
          },
        )
        .subscribe();
    }

    subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    startTransition(() => router.refresh());
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
    startTransition(() => router.refresh());
  }

  async function deleteNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
    startTransition(() => router.refresh());
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BellOff className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-1">No notifications yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          When you receive order updates, promotions, or system messages,
          they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={isPending}
            className="gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.map((notification) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;
          const isNew = newIds.has(notification.id);

          return (
            <div
              key={notification.id}
              className={cn(
                "group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-500",
                notification.is_read
                  ? "bg-background border-border/50"
                  : "bg-primary/[0.02] border-primary/20",
                isNew &&
                  "animate-in slide-in-from-top-2 shadow-md ring-1 ring-primary/30",
              )}
            >
              {/* Unread dot */}
              {!notification.is_read && (
                <div className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}

              {/* Icon */}
              <div
                className={cn(
                  "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                  config.color,
                )}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm leading-tight">
                        {notification.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                    )}
                    <span className="text-xs text-muted-foreground/70 mt-1 block">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
