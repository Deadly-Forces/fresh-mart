import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateDraftPO() {
    const supabase = await createClient();

    // 1. Fetch products
    const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("is_active", true);

    if (productsError || !products) {
        console.error("Failed to fetch products:", productsError);
        return { success: false, error: "Failed to fetch products" };
    }

    // 2. Fetch last 14 days of orders to calculate daily velocity
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentOrders, error: ordersError } = await supabase
        .from("orders")
        .select(`
      id,
      order_items ( product_id, quantity )
    `)
        .gte("created_at", fourteenDaysAgo);

    const productVelocity: Record<string, number> = {};
    if (!ordersError && recentOrders) {
        for (const order of recentOrders) {
            for (const item of (order.order_items || []) as any[]) {
                const pid = item.product_id;
                if (!productVelocity[pid]) productVelocity[pid] = 0;
                productVelocity[pid] += (item.quantity || 1);
            }
        }
    }

    // Calculate daily velocity and days of cover (stock / daily_velocity)
    const inventoryData = products.map(p => {
        const total14Days = productVelocity[p.id] || 0;
        const dailyVelocity = total14Days / 14;
        const stock = p.stock || 0;
        const daysOfCover = dailyVelocity > 0 ? stock / dailyVelocity : 999;

        return {
            id: p.id,
            name: p.name,
            stock,
            daily_velocity: Number(dailyVelocity.toFixed(2)),
            days_of_cover: Number(daysOfCover.toFixed(1))
        };
    });

    // 3. Identify items to reorder (less than 7 days of cover remaining)
    // We only target items that are actually selling (daily_velocity > 0).
    const itemsToReorder = inventoryData.filter(item => item.days_of_cover < 7 && item.daily_velocity > 0);

    if (itemsToReorder.length === 0) {
        return { success: true, draft_po: null, note: "Inventory is healthy. No PO needed." };
    }

    // 4. Generate Draft Purchase Order using LLM
    try {
        const { object } = await generateObject({
            model: openrouter(process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini"),
            schema: z.object({
                draft_po: z.object({
                    po_number: z.string(),
                    date: z.string(),
                    items: z.array(z.object({
                        product_name: z.string(),
                        current_stock: z.number(),
                        days_of_cover: z.number(),
                        suggested_reorder_qty: z.number().describe("Quantity needed to cover at least 30 days of inventory based on daily velocity."),
                        justification: z.string()
                    })),
                    summary: z.string().describe("A brief summary of the state of our inventory.")
                })
            }),
            messages: [
                {
                    role: "system",
                    content: "You are an AI Inventory Manager for Fresh Mart. Analyze the low-stock items and create a draft Purchase Order. Suggest a reorder quantity that provides roughly 30 days of coverage based on their daily sales velocity."
                },
                {
                    role: "user",
                    content: `Here are the products critically low on stock (under 7 days of cover left).
          Current Data:
          ${JSON.stringify(itemsToReorder, null, 2)}
          
          Generate a detailed JSON draft PO.`
                }
            ]
        });

        return { success: true, draft_po: object.draft_po };
    } catch (error) {
        console.error("Failed to generate draft PO:", error);
        return { success: false, error: "Failed to generate draft PO" };
    }
}
