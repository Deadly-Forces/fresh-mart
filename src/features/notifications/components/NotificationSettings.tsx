"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    refresh,
  } = usePushNotifications();

  const [actionLoading, setActionLoading] = useState(false);

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Your browser doesn&apos;t support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permission === "denied") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-destructive" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Notifications are blocked. Please enable them in your browser
            settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          {isSubscribed
            ? "You'll receive notifications about your orders and exclusive deals."
            : "Enable notifications to get real-time updates on your orders."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {isSubscribed
                ? "Notifications Enabled"
                : "Notifications Disabled"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed
                ? "Click to disable push notifications"
                : "Click to enable push notifications"}
            </p>
          </div>
          <Button
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        </div>

        {isSubscribed && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              You&apos;ll receive notifications for:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Order confirmations and status updates
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Delivery notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Exclusive deals and flash sales
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
