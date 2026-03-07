import { NextResponse } from "next/server";
import { analyzeOrderFraud } from "@/lib/ai/fraudDetection";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        // Usually protected by admin session check or a secret webhook token
        const result = await analyzeOrderFraud(orderId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Fraud API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
