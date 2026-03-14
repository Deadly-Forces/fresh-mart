import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID, rateLimit, sanitizeString } from "@/lib/security";
import { triageSupportMessage } from "@/lib/support/triage";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firstName = sanitizeString(body.firstName, 80);
    const lastName = sanitizeString(body.lastName, 80);
    const email = sanitizeString(body.email, 160);
    const message = sanitizeString(body.message, 2000);
    const orderId = sanitizeString(body.orderId, 80);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please provide more detail so support can help you." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rateLimitKey = user?.id ? `contact:${user.id}` : `contact:${email}`;
    if (!rateLimit(rateLimitKey, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many contact attempts. Please wait a minute." },
        { status: 429 },
      );
    }

    let safeOrderId: string | null = null;
    let orderContext: unknown = null;

    if (orderId && isValidUUID(orderId) && user) {
      const { data: order } = await supabase
        .from("orders")
        .select(
          `
            id, status, total, created_at,
            order_items ( quantity, product_snapshot )
          `,
        )
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (order) {
        safeOrderId = order.id;
        orderContext = order;
      }
    }

    const triage = await triageSupportMessage(message, orderContext);

    const { data: insertedTicket, error: insertError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user?.id ?? null,
        order_id: safeOrderId,
        first_name: firstName,
        last_name: lastName,
        email,
        message,
        category: triage.category,
        priority: triage.priority,
        summary: triage.summary,
        suggested_action: triage.suggested_action,
        draft_response: triage.draft_response,
        status:
          triage.suggested_action === "escalate_to_human"
            ? "triaged"
            : "open",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Contact ticket insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit your message. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      ticketId: insertedTicket.id,
      triage,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to submit your support request." },
      { status: 500 },
    );
  }
}
