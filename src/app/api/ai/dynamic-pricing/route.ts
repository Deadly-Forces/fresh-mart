import { NextResponse } from "next/server";
import { processDynamicPricing } from "@/features/admin/ai/dynamicPricing";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// This endpoint could be called by a CRON job (e.g., Vercel Cron)
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await processDynamicPricing();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in dynamic pricing:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
