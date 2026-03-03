/**
 * usePushNotifications Hook
 * React hook for managing push notification state and actions
 */

import { useState, useEffect, useCallback } from "react";
import {
  isPushSupported,
  getNotificationPermission,
  getCurrentSubscription,
  setupPushNotifications,
  unsubscribeFromPush,
  registerServiceWorker,
} from "@/lib/push";

export type PushState = {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
};

export type UsePushNotificationsReturn = PushState & {
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  refresh: () => Promise<void>;
};

export function usePushNotifications(): UsePushNotificationsReturn {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    permission: "unsupported",
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  // Check push notification state
  const checkState = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const isSupported = isPushSupported();
    if (!isSupported) {
      setState({
        isSupported: false,
        permission: "unsupported",
        isSubscribed: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    const permission = getNotificationPermission();
    let isSubscribed = false;

    if (permission === "granted") {
      const subscription = await getCurrentSubscription();
      isSubscribed = !!subscription;
    }

    setState({
      isSupported: true,
      permission,
      isSubscribed,
      isLoading: false,
      error: null,
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    // Register service worker and check state
    registerServiceWorker().then(() => {
      checkState();
    });
  }, [checkState]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await setupPushNotifications();

      if (result.success) {
        setState((prev) => ({
          ...prev,
          permission: "granted",
          isSubscribed: true,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          permission: result.permission || prev.permission,
          isLoading: false,
          error: result.error || "Failed to subscribe",
        }));
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await unsubscribeFromPush();

      if (success) {
        setState((prev) => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to unsubscribe",
        }));
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  // Refresh state
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await checkState();
  }, [checkState]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    refresh,
  };
}
