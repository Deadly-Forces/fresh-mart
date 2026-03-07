import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function processDynamicPricing() {
    const supabase = await createClient();

    // 1. Fetch active products
    const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, compare_price, stock, category_id")
        .eq("is_active", true);

    if (productsError || !products) {
        console.error("Failed to fetch products:", productsError);
        return { success: false, error: "Failed to fetch products" };
    }

    // 2. Fetch recent orders (last 7 days) to calculate velocity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentOrders, error: ordersError } = await supabase
        .from("orders")
        .select(`
      id,
      order_items ( product_id, quantity )
    `)
        .gte("created_at", sevenDaysAgo);

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

    // 3. Identify candidates for price adjustment
    // Candidate A: High stock (>30), low velocity (<2) -> Suggest discount
    // Candidate B: Low stock (<10), high velocity (>10) -> Suggest price increase

    const candidates = products.map(p => {
        const velocity = productVelocity[p.id] || 0;
        return {
            id: p.id,
            name: p.name,
            current_price: p.price,
            compare_price: p.compare_price,
            stock: p.stock || 0,
            velocity_last_7_days: velocity
        };
    }).filter(p => {
        const isSlowMoving = p.velocity_last_7_days < 2 && p.stock > 30;
        const isFastMoving = p.velocity_last_7_days > 10 && p.stock <= 10;
        return isSlowMoving || isFastMoving;
    });

    if (candidates.length === 0) {
        return { success: true, updatedCount: 0, note: "No pricing adjustments needed at this time." };
    }

    // 4. Use LLM to determine the new prices
    // Limit to top 50 to avoid massive context length
    const targetCandidates = candidates.slice(0, 50);

    try {
        const { object } = await generateObject({
            model: openrouter(process.env.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-4o-mini"),
            schema: z.object({
                adjustments: z.array(z.object({
                    product_id: z.string(),
                    new_price: z.number().describe("The suggested new price in INR. Should be lower for slow moving items, higher for fast moving items."),
                    reason: z.string().describe("A short explanation of why the price is adjusted.")
                }))
            }),
            messages: [
                {
                    role: "system",
                    content: "You are an AI Pricing Engine for a grocery store. Your job is to optimize prices based on stock and sales momentum."
                },
                {
                    role: "user",
                    content: `Here are products that need price adjustments due to anomalous stock-to-velocity ratios.
          If velocity is low and stock is high, slightly discount the price (e.g., 5-15% lower). 
          If velocity is high and stock is low, slightly increase the price (e.g., 5-10% higher) to maximize margins before stockout.
          Current Data:
          ${JSON.stringify(targetCandidates, null, 2)}
          
          Return JSON with the adjusted prices.`
                }
            ]
        });

        // 5. Apply the adjustments
        let updatedCount = 0;

        for (const adj of object.adjustments) {
            const originalProduct = targetCandidates.find(p => p.id === adj.product_id);
            if (!originalProduct) continue;

            // Ensure the new price isn't crazily different (safety check: max 30% change)
            const maxIncrease = originalProduct.current_price * 1.3;
            const maxDecrease = originalProduct.current_price * 0.7;

            let finalPrice = adj.new_price;
            if (finalPrice > maxIncrease) finalPrice = maxIncrease;
            if (finalPrice < maxDecrease) finalPrice = maxDecrease;

            // Round to 2 decimal places
            finalPrice = Math.round(finalPrice * 100) / 100;

            // Ensure price > 0
            if (finalPrice <= 0) finalPrice = originalProduct.current_price;

            // If price decreased, set compare_price to the original price to show a discount
            const comparePrice = finalPrice < originalProduct.current_price
                ? originalProduct.current_price
                : null;

            const { error: updateError } = await supabase
                .from("products")
                .update({
                    price: finalPrice,
                    compare_price: comparePrice
                })
                .eq("id", originalProduct.id);

            if (!updateError) {
                updatedCount++;
                console.log(`[Pricing] Adjusted ${originalProduct.name}: ${originalProduct.current_price} -> ${finalPrice}. Reason: ${adj.reason}`);
            }
        }

        return { success: true, updatedCount, adjustments: object.adjustments };
    } catch (error) {
        console.error("Failed to generate or apply dynamic pricing:", error);
        return { success: false, error: "Failed to process dynamic pricing" };
    }
}
