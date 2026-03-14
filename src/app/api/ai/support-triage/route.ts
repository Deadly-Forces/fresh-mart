import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triageSupportMessage } from "@/lib/support/triage";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, orderId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    let orderContext = null;
    if (orderId) {
      const { data: order } = await supabase
        .from("orders")
        .select(
          `
          id, status, total, created_at,
          order_items ( product_snapshot )
        `,
        )
        .eq("id", orderId)
        .single();
      if (order) orderContext = order;
    }

    const triage = await triageSupportMessage(message, orderContext);

    return NextResponse.json({ success: true, triage });
  } catch (error) {
    console.error("Support Triage Error:", error);
    return NextResponse.json(
      { error: "Failed to triage support message" },
      { status: 500 },
    );
  }
}
