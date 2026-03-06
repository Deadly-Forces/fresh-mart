"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Send,
  Users,
  User,
  Package,
  Megaphone,
  Info,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sendAdminNotificationAction } from "@/features/admin/actions/productActions";

interface NotificationItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "order_update" | "promo" | "system";
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
}

const typeConfig = {
  order_update: {
    icon: Package,
    label: "Order",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    badgeVariant: "default" as const,
  },
  promo: {
    icon: Megaphone,
    label: "Promo",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40",
    badgeVariant: "secondary" as const,
  },
  system: {
    icon: Info,
    label: "System",
    color: "text-gray-600 bg-gray-50 dark:bg-gray-950/40",
    badgeVariant: "outline" as const,
  },
};

export function AdminNotificationsClient({
  notifications,
  users,
}: {
  notifications: NotificationItem[];
  users: UserItem[];
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"promo" | "system">("promo");
  const [target, setTarget] = useState<"all" | "user">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const router = useRouter();

  function handleSend() {
    if (!title.trim()) {
      setFeedback({ type: "error", msg: "Title is required." });
      return;
    }
    if (target === "user" && !selectedUserId) {
      setFeedback({ type: "error", msg: "Select a user." });
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const result = await sendAdminNotificationAction({
        title: title.trim(),
        message: message.trim(),
        type,
        userId: target === "user" ? selectedUserId : undefined,
      });
      if (result.error) {
        setFeedback({ type: "error", msg: result.error });
      } else {
        setFeedback({
          type: "success",
          msg: `Sent to ${result.count} user${result.count === 1 ? "" : "s"}.`,
        });
        setTitle("");
        setMessage("");
        router.refresh();
      }
    });
  }

  const totalSent = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send notifications to customers and view history.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">
            Total Sent
          </p>
          <p className="text-2xl font-bold mt-1">{totalSent}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Unread</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">
            {unreadCount}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-muted-foreground font-medium">
            Read Rate
          </p>
          <p className="text-2xl font-bold mt-1">
            {totalSent > 0
              ? `${Math.round(((totalSent - unreadCount) / totalSent) * 100)}%`
              : "—"}
          </p>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2 text-base">
          <Send className="w-4 h-4" />
          Send Notification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType("promo")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                  type === "promo"
                    ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-400"
                    : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary",
                )}
              >
                <Megaphone className="w-3.5 h-3.5 inline mr-1.5" />
                Promo
              </button>
              <button
                onClick={() => setType("system")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                  type === "system"
                    ? "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-950/40 dark:border-gray-700 dark:text-gray-300"
                    : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary",
                )}
              >
                <Info className="w-3.5 h-3.5 inline mr-1.5" />
                System
              </button>
            </div>
          </div>

          {/* Target */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Target
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTarget("all");
                  setSelectedUserId("");
                }}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                  target === "all"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary",
                )}
              >
                <Users className="w-3.5 h-3.5 inline mr-1.5" />
                All Users
              </button>
              <button
                onClick={() => setTarget("user")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                  target === "user"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary",
                )}
              >
                <User className="w-3.5 h-3.5 inline mr-1.5" />
                Specific User
              </button>
            </div>
          </div>
        </div>

        {/* User picker */}
        {target === "user" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Select User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              aria-label="Select user"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Choose a user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flash Sale - 20% OFF!"
            maxLength={200}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Notification message…"
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        {/* Feedback + Send */}
        <div className="flex items-center justify-between">
          {feedback && (
            <p
              className={cn(
                "text-sm font-medium",
                feedback.type === "success"
                  ? "text-green-600"
                  : "text-destructive",
              )}
            >
              {feedback.msg}
            </p>
          )}
          <Button
            onClick={handleSend}
            disabled={isPending || !title.trim()}
            className="ml-auto gap-1.5"
          >
            <Send className="w-4 h-4" />
            {isPending ? "Sending…" : "Send Notification"}
          </Button>
        </div>
      </div>

      {/* Notification History */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base">Recent Notifications</h2>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No notifications sent yet.
          </div>
        ) : (
          <div className="rounded-xl border bg-card divide-y divide-border overflow-hidden">
            {notifications.map((n) => {
              const config = typeConfig[n.type];
              const Icon = config.icon;
              return (
                <div key={n.id} className="flex items-start gap-3 p-4">
                  <div
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                      config.color,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{n.title}</span>
                      <Badge variant={config.badgeVariant} className="text-[10px] px-1.5 py-0 h-4">
                        {config.label}
                      </Badge>
                      {n.isRead ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                      )}
                    </div>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/70">
                      <span>
                        To: {n.userName}{" "}
                        {n.userEmail && (
                          <span className="text-muted-foreground/50">
                            ({n.userEmail})
                          </span>
                        )}
                      </span>
                      <span>
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
