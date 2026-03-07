import { NextResponse } from "next/server";
import { processPredictiveReordering } from "@/lib/ai/predictiveReordering";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5 minutes since processing many users and calling LLMs could take time

// This endpoint could be called by a CRON job (e.g., Vercel Cron)
export async function GET(req: Request) {
    // Add some basic auth in a real app, like checking an API key
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await processPredictiveReordering();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in predictive reordering:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
