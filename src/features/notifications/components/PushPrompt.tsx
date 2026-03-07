"use client";

import { useState, useEffect } from "react";
import { BellRing, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isPushSupported,
  getNotificationPermission,
  setupPushNotifications,
  registerServiceWorker,
} from "@/lib/push";

export function PushPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();

    // Check if we should show the prompt
    const checkPermission = () => {
      // Don't show if push not supported
      if (!isPushSupported()) {
        return;
      }

      // Only show if permission is 'default' (not yet asked)
      const permission = getNotificationPermission();
      if (permission !== "default") {
        return;
      }

      // Check if user has dismissed recently (stored in localStorage)
      const dismissedAt = localStorage.getItem("push_prompt_dismissed");
      if (dismissedAt) {
        const dismissedTime = new Date(dismissedAt).getTime();
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        // Don't show again for 7 days after dismissal
        if (now - dismissedTime < 7 * dayInMs) {
          return;
        }
      }

      // Show prompt after a delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    };

    checkPermission();
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await setupPushNotifications();

      if (result.success) {
        console.log(
          "[Push Service] Successfully subscribed to push notifications",
        );
        setIsVisible(false);
      } else {
        if (result.permission === "denied") {
          setError("Notifications blocked. Enable in browser settings.");
        } else {
          setError(result.error || "Failed to enable notifications");
        }
      }
    } catch (err) {
      console.error("[Push Service] Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    // Store dismissal time
    localStorage.setItem("push_prompt_dismissed", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl z-50 flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="bg-white/20 p-2 rounded-full mt-1 shrink-0">
        <BellRing className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm mb-1">Enable Order Updates</h3>
        <p className="text-xs text-primary-foreground/80 mb-2 leading-relaxed">
          Get real-time push notifications when your order is out for delivery.
        </p>
        {error && <p className="text-xs text-red-200 mb-2">{error}</p>}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-8 px-4"
            onClick={handleEnable}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Enabling...
              </>
            ) : (
              "Enable"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-3 hover:bg-black/10"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            Not Now
          </Button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-primary-foreground/60 hover:text-white transition-colors"
        aria-label="Dismiss"
        disabled={isLoading}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
