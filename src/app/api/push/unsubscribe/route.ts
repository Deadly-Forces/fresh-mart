/**
 * Push Notification Unsubscribe API
 * POST /api/push/unsubscribe - Unsubscribe from push notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Delete the subscription
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);

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
