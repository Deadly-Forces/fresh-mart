/**
 * Push Notification Subscription API
 * POST /api/push/subscribe - Subscribe to push notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, userId } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get the current user if userId not provided
    let subscriberId = userId;
    if (!subscriberId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      subscriberId = user?.id;
    }

    // Extract subscription details
    const { endpoint, keys } = subscription;
    const p256dh = keys?.p256dh;
    const auth = keys?.auth;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: "Invalid subscription keys" },
        { status: 400 },
      );
    }

    // Upsert the subscription (update if endpoint exists, insert if not)
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_id: subscriberId || null,
          user_agent: request.headers.get("user-agent") || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "endpoint",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (error) {
      console.error("[Push Subscribe] Database error:", error);
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 },
      );
    }

    console.log("[Push Subscribe] Subscription saved:", data.id);

    return NextResponse.json({
      success: true,
      message: "Subscription saved successfully",
      subscriptionId: data.id,
    });
  } catch (error) {
    console.error("[Push Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
