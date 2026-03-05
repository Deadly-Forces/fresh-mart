/**
 * Push Notification Unsubscribe API
 * POST /api/push/unsubscribe - Unsubscribe from push notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Require authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Rate limit: 10 unsubscribe requests per minute per user
    if (!rateLimit(`push-unsubscribe:${user.id}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 },
      );
    }

    // Only allow users to unsubscribe their own subscriptions
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", user.id);

    if (error) {
      console.error("[Push Unsubscribe] Database error:", error);
      return NextResponse.json(
        { error: "Failed to remove subscription" },
        { status: 500 },
      );
    }

    console.log(
      "[Push Unsubscribe] Subscription removed for endpoint:",
      endpoint.slice(0, 50),
    );

    return NextResponse.json({
      success: true,
      message: "Subscription removed successfully",
    });
  } catch (error) {
    console.error("[Push Unsubscribe] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
