/**
 * Send Push Notification API
 * POST /api/push/send - Send push notifications (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripHtml } from "@/lib/security";
import {
  sendPushNotificationBatch,
  NotificationPayload,
  OrderNotifications,
  isVapidConfigured,
} from "@/lib/push/server";
import { PushSubscription } from "web-push";

export async function POST(request: NextRequest) {
  try {
    // Check VAPID configuration
    if (!isVapidConfigured()) {
      return NextResponse.json(
        { error: "Push notifications not configured" },
        { status: 503 },
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { type, payload, targetUserId, orderId } = body;

    // Validate inputs
    if (targetUserId && typeof targetUserId !== "string") {
      return NextResponse.json(
        { error: "Invalid target user ID" },
        { status: 400 },
      );
    }

    if (orderId && typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Build notification payload
    let notification: NotificationPayload;

    if (type && orderId) {
      // Order notification templates
      switch (type) {
        case "order_confirmed":
          notification = OrderNotifications.orderConfirmed(orderId);
          break;
        case "order_picked":
          notification = OrderNotifications.orderPicked(orderId);
          break;
        case "order_out_for_delivery":
          notification = OrderNotifications.orderOutForDelivery(
            orderId,
            stripHtml(String(body.riderName || "Your rider")),
          );
          break;
        case "order_delivered":
          notification = OrderNotifications.orderDelivered(orderId);
          break;
        case "order_cancelled":
          notification = OrderNotifications.orderCancelled(orderId);
          break;
        default:
          return NextResponse.json(
            { error: "Invalid notification type" },
            { status: 400 },
          );
      }
    } else if (payload) {
      // Custom notification payload
      notification = payload as NotificationPayload;
    } else {
      return NextResponse.json(
        { error: "Missing notification payload or type" },
        { status: 400 },
      );
    }

    // Fetch subscriptions
    let query = supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("is_active", true);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error("[Push Send] Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 },
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscriptions found",
        sent: 0,
      });
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

      console.log(
        "[Push Send] Deactivated invalid subscriptions:",
        results.invalidSubscriptions.length,
      );
    }

    return NextResponse.json({
      success: true,
      sent: results.successful,
      failed: results.failed,
      invalidated: results.invalidSubscriptions.length,
    });
  } catch (error) {
    console.error("[Push Send] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
