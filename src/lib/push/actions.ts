/**
 * Push Notification Actions
 * Server actions for sending push notifications
 */

import { createClient } from "@/lib/supabase/server";
import {
  sendPushNotificationBatch,
  NotificationPayload,
  OrderNotifications,
  PromoNotifications,
  isVapidConfigured,
} from "@/lib/push/server";
import { PushSubscription } from "web-push";

/**
 * Send order status update notification to a user
 */
export async function sendOrderNotification(
  orderId: string,
  userId: string,
  status:
    | "confirmed"
    | "picked"
    | "out_for_delivery"
    | "delivered"
    | "cancelled",
  riderName?: string,
): Promise<{ success: boolean; sent?: number; error?: string }> {
  if (!isVapidConfigured()) {
    console.warn("[Push] VAPID not configured, skipping notification");
    return { success: false, error: "Push not configured" };
  }

  const supabase = await createClient();

  // Get notification payload based on status
  let notification: NotificationPayload;
  switch (status) {
    case "confirmed":
      notification = OrderNotifications.orderConfirmed(orderId);
      break;
    case "picked":
      notification = OrderNotifications.orderPicked(orderId);
      break;
    case "out_for_delivery":
      notification = OrderNotifications.orderOutForDelivery(orderId, riderName);
      break;
    case "delivered":
      notification = OrderNotifications.orderDelivered(orderId);
      break;
    case "cancelled":
      notification = OrderNotifications.orderCancelled(orderId);
      break;
  }

  // Get user's push subscriptions
  const { data: subscriptions, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (fetchError) {
    console.error("[Push] Failed to fetch subscriptions:", fetchError);
    return { success: false, error: "Failed to fetch subscriptions" };
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { success: true, sent: 0 };
  }

  // Convert to web-push format
  const pushSubscriptions: PushSubscription[] = subscriptions.map((sub) => ({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }));

  // Send notifications
  const results = await sendPushNotificationBatch(
    pushSubscriptions,
    notification,
  );

  // Clean up invalid subscriptions
  if (results.invalidSubscriptions.length > 0) {
    await supabase
      .from("push_subscriptions")
      .update({ is_active: false })
      .in("endpoint", results.invalidSubscriptions);
  }

  return { success: true, sent: results.successful };
}

/**
 * Send promotional notification to all subscribed users
 */
export async function sendPromoNotification(
  notification: NotificationPayload,
): Promise<{
  success: boolean;
  sent?: number;
  failed?: number;
  error?: string;
}> {
  if (!isVapidConfigured()) {
    return { success: false, error: "Push not configured" };
  }

  const supabase = await createClient();

  // Get all active subscriptions
  const { data: subscriptions, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("is_active", true);

  if (fetchError) {
    console.error("[Push] Failed to fetch subscriptions:", fetchError);
    return { success: false, error: "Failed to fetch subscriptions" };
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { success: true, sent: 0, failed: 0 };
  }

  // Convert to web-push format
  const pushSubscriptions: PushSubscription[] = subscriptions.map((sub) => ({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }));

  // Send notifications
  const results = await sendPushNotificationBatch(
    pushSubscriptions,
    notification,
  );

  // Clean up invalid subscriptions
  if (results.invalidSubscriptions.length > 0) {
    await supabase
      .from("push_subscriptions")
      .update({ is_active: false })
      .in("endpoint", results.invalidSubscriptions);
  }

  return {
    success: true,
    sent: results.successful,
    failed: results.failed,
  };
}

/**
 * Send flash sale notification
 */
export async function sendFlashSaleNotification(
  discount: number,
  endsIn: string,
): Promise<{ success: boolean; sent?: number; error?: string }> {
  const notification = PromoNotifications.flashSale(discount, endsIn);
  return sendPromoNotification(notification);
}

/**
 * Send back in stock notification
 */
export async function sendBackInStockNotification(
  productName: string,
  productSlug: string,
): Promise<{ success: boolean; sent?: number; error?: string }> {
  const notification = PromoNotifications.backInStock(productName, productSlug);
  return sendPromoNotification(notification);
}

/**
 * Send price drop notification
 */
export async function sendPriceDropNotification(
  productName: string,
  productSlug: string,
  newPrice: string,
): Promise<{ success: boolean; sent?: number; error?: string }> {
  const notification = PromoNotifications.priceDropped(
    productName,
    productSlug,
    newPrice,
  );
  return sendPromoNotification(notification);
}
