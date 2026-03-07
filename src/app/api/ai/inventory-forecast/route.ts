import { NextResponse } from "next/server";
import { generateDraftPO } from "@/lib/ai/inventoryForecasting";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await generateDraftPO();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error generating draft PO:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
