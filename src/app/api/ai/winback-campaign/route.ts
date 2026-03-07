import { NextResponse } from "next/server";
import { processWinbackCampaign } from "@/lib/ai/winbackCampaign";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5 minutes

export async function GET(req: Request) {
    // Add some basic auth in a real app
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await processWinbackCampaign();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in winback campaign:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
