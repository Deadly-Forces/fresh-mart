/**
 * Server-side Push Notification Utilities
 * Uses web-push library to send push notifications
 */

import webPush, { PushSubscription, SendResult } from "web-push";

// Configure VAPID keys from environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:admin@fresh-mart.com";

// Initialize web-push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
): Promise<SendResult> {
  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/badge-72x72.png",
    tag: payload.tag || `notification-${Date.now()}`,
    data: {
      url: payload.url || "/",
      ...payload.data,
    },
    actions: payload.actions,
    requireInteraction: payload.requireInteraction,
  });

  return webPush.sendNotification(subscription, notificationPayload);
}

/**
 * Send push notifications to multiple subscriptions
 */
export async function sendPushNotificationBatch(
  subscriptions: PushSubscription[],
  payload: NotificationPayload,
): Promise<{
  successful: number;
  failed: number;
  invalidSubscriptions: string[];
}> {
  const results = {
    successful: 0,
    failed: 0,
    invalidSubscriptions: [] as string[],
  };

  const sendPromises = subscriptions.map(async (subscription) => {
    try {
      await sendPushNotification(subscription, payload);
      results.successful++;
    } catch (error: unknown) {
      results.failed++;
      // Check if subscription is expired/invalid (status code 410 or 404)
      if (
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        (error.statusCode === 410 || error.statusCode === 404)
      ) {
        results.invalidSubscriptions.push(subscription.endpoint);
      }
      console.error("[Push] Send failed:", error);
    }
  });

  await Promise.allSettled(sendPromises);
  return results;
}

/**
 * Order notification templates
 */
export const OrderNotifications = {
  orderConfirmed: (orderId: string): NotificationPayload => ({
    title: "Order Confirmed! 🎉",
    body: `Your order #${orderId.slice(-8).toUpperCase()} has been confirmed and is being prepared.`,
    tag: `order-${orderId}-confirmed`,
    url: `/profile/orders/${orderId}`,
    requireInteraction: false,
  }),

  orderPicked: (orderId: string): NotificationPayload => ({
    title: "Order Being Picked 🛒",
    body: `Your order #${orderId.slice(-8).toUpperCase()} items are being picked from our store.`,
    tag: `order-${orderId}-picked`,
    url: `/profile/orders/${orderId}`,
  }),

  orderOutForDelivery: (
    orderId: string,
    riderName?: string,
  ): NotificationPayload => ({
    title: "Out for Delivery! 🚴",
    body: riderName
      ? `${riderName} is on the way with your order #${orderId.slice(-8).toUpperCase()}.`
      : `Your order #${orderId.slice(-8).toUpperCase()} is out for delivery.`,
    tag: `order-${orderId}-delivery`,
    url: `/profile/orders/${orderId}`,
    requireInteraction: true,
    actions: [
      { action: "track", title: "Track Order" },
      { action: "close", title: "Dismiss" },
    ],
  }),

  orderDelivered: (orderId: string): NotificationPayload => ({
    title: "Order Delivered! ✅",
    body: `Your order #${orderId.slice(-8).toUpperCase()} has been delivered. Enjoy!`,
    tag: `order-${orderId}-delivered`,
    url: `/profile/orders/${orderId}`,
    actions: [
      { action: "rate", title: "Rate Order" },
      { action: "close", title: "Dismiss" },
    ],
  }),

  orderCancelled: (orderId: string): NotificationPayload => ({
    title: "Order Cancelled",
    body: `Your order #${orderId.slice(-8).toUpperCase()} has been cancelled. Refund will be processed.`,
    tag: `order-${orderId}-cancelled`,
    url: `/profile/orders/${orderId}`,
  }),
};

/**
 * Promotional notification templates
 */
export const PromoNotifications = {
  flashSale: (discount: number, endsIn: string): NotificationPayload => ({
    title: `⚡ Flash Sale - ${discount}% OFF!`,
    body: `Hurry! Sale ends in ${endsIn}. Don't miss out on amazing deals!`,
    tag: "promo-flash-sale",
    url: "/shop?sale=true",
    requireInteraction: true,
  }),

  backInStock: (
    productName: string,
    productSlug: string,
  ): NotificationPayload => ({
    title: "Back in Stock! 📦",
    body: `Great news! ${productName} is back in stock.`,
    tag: `stock-${productSlug}`,
    url: `/product/${productSlug}`,
  }),

  priceDropped: (
    productName: string,
    productSlug: string,
    newPrice: string,
  ): NotificationPayload => ({
    title: "Price Drop Alert! 💰",
    body: `${productName} is now ${newPrice}. Grab it before it's gone!`,
    tag: `price-${productSlug}`,
    url: `/product/${productSlug}`,
  }),
};

/**
 * Validate VAPID configuration
 */
export function isVapidConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

/**
 * Get the VAPID public key (for client-side use)
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
