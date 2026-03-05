/**
 * Push Notification Utilities for Fresh Mart
 * Client-side Web Push API implementation
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Check if push notifications are supported in this browser
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get the current notification permission status
 */
export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (!isPushSupported()) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Convert a base64 string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) {
    console.warn("[Push] Push notifications not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("[Push] Service Worker registered:", registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error("[Push] Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error("Push notifications not supported");
  }

  const permission = await Notification.requestPermission();
  console.log("[Push] Permission:", permission);
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) {
    console.error("[Push] VAPID public key not configured");
    return null;
  }

  try {
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log("[Push] Already subscribed");
      return subscription;
    }

    // Create new subscription
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log("[Push] New subscription created");
    return subscription;
  } catch (error) {
    console.error("[Push] Subscription failed:", error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("[Push] Unsubscribed successfully");

      // Notify server about unsubscription
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("[Push] Unsubscribe failed:", error);
    return false;
  }
}

/**
 * Save push subscription to the server
 */
export async function saveSubscriptionToServer(
  subscription: PushSubscription,
): Promise<boolean> {
  try {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription");
    }

    console.log("[Push] Subscription saved to server");
    return true;
  } catch (error) {
    console.error("[Push] Failed to save subscription:", error);
    return false;
  }
}

/**
 * Get the current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("[Push] Failed to get subscription:", error);
    return null;
  }
}

/**
 * Full push notification setup flow
 * 1. Register service worker
 * 2. Request permission
 * 3. Subscribe to push
 * 4. Save to server
 */
export async function setupPushNotifications(): Promise<{
  success: boolean;
  permission?: NotificationPermission;
  subscription?: PushSubscription;
  error?: string;
}> {
  try {
    // Step 1: Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, error: "Service worker registration failed" };
    }

    // Step 2: Request permission
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      return { success: false, permission, error: "Permission denied" };
    }

    // Step 3: Subscribe to push
    const subscription = await subscribeToPush(registration);
    if (!subscription) {
      return { success: false, permission, error: "Subscription failed" };
    }

    // Step 4: Save to server
    const saved = await saveSubscriptionToServer(subscription);
    if (!saved) {
      return {
        success: false,
        permission,
        subscription,
        error: "Failed to save subscription",
      };
    }

    return { success: true, permission, subscription };
  } catch (error) {
    console.error("[Push] Setup failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Show a local notification (for testing or client-side notifications)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  if (!isPushSupported()) {
    console.warn("[Push] Notifications not supported");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("[Push] Permission not granted");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    ...options,
  });
}
