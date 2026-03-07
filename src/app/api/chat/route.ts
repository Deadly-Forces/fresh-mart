import { openrouter } from "@/lib/openrouter";
import { streamText, convertToModelMessages } from "ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// Models tried in order until one works
const CHAT_MODELS = [
    process.env.OPENROUTER_MODEL,
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-3-4b-it:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
].filter(Boolean) as string[];

// ── Static knowledge base about the FreshMart website ──────────────────────
const SITE_KNOWLEDGE = `
## FRESHMART WEBSITE — FULL KNOWLEDGE BASE

### What is FreshMart?
FreshMart is an online grocery delivery platform that lets customers browse, buy, and have fresh groceries delivered to their door.

### Pages & Features Available to Customers

**Shopping**
- /shop — Browse all products with filters (category, price, dietary labels). Supports keyword and AI-powered recipe search.
- /category/[slug] — View products by category (vegetables, fruits, dairy, snacks, beverages, etc.)
- /product/[id] — Individual product page with description, images, ratings, reviews.
- /search — Full-text product search.

**Cart & Checkout**
- /cart — View and manage cart items, apply coupons, see totals.
- /checkout — Enter delivery address, choose payment (Credit/Debit card, UPI, Cash on Delivery), place order.

**Account & Profile**
- /profile — Account dashboard: profile details, saved addresses, order history, loyalty rewards, referrals, returns.
- Profile tabs: Profile Details, My Addresses, Order History, Rewards (loyalty points), Referrals, Returns.

**Orders**
- Order History — All past orders with status, invoice download, and option to cancel or reorder.
- Order statuses: Confirmed → Packed → Shipping → Delivered (or Cancelled).
- Invoice download available for each order.

**Wishlist**
- /wishlist — Save products for later. Requires login.

**Cooking Assistant**
- /assistant — AI-powered cooking assistant. Suggests recipes using products available in the store.

**Loyalty & Referrals**
- Loyalty points earned on every purchase, redeemable for discounts.
- Refer friends for bonus points.
- Coupons can be applied at checkout.

**Content Pages**
- /about — About FreshMart company.
- /blog — Recipes, tips, and grocery articles.
- /faq — Frequently asked questions.
- /contact — Contact support.
- /careers — Job listings.
- /stores — Physical store locations.
- /shipping — Delivery and shipping policy.
- /refunds — Refund and cancellation policy.
- /returns — How to return products.
- /privacy — Privacy policy.
- /terms — Terms of service.
- /cookies — Cookie policy.
- /security — Security information.

### How to Do Common Tasks

**How to order?**
1. Add products to cart from /shop or any product page.
2. Go to /cart and review items.
3. Click "Checkout", enter your address, choose payment method, and confirm.

**How to track an order?**
Go to /profile → Order History tab. Each order shows its current status (Confirmed, Packed, Shipping, Delivered).

**How to cancel an order?**
In /profile → Order History, click "Cancel Order" on the order (only available when status is Confirmed or Packed).

**How to return a product?**
Go to /profile → Returns tab and submit a return request. Or visit /returns page.

**How to apply a coupon?**
On the /cart page, there is a coupon input field. Enter the code and click Apply.

**How to use loyalty points?**
In /profile → Rewards tab, redeem points to generate a discount coupon code. Apply it at checkout.

**How to use the recipe search?**
On the /shop page, type something like "ingredients for pasta" in the search bar. The AI will expand it and show all matching ingredients available in the store.

**How to use the Cooking Assistant?**
Visit /assistant from the main navigation. Type what you want to cook or what ingredients you have. The AI suggests recipes using products available in the store.

### Policies (Summary)
- Free delivery above ₹499 (subject to change).
- Returns accepted within 24 hours for fresh produce, 7 days for packaged goods.
- Refunds processed within 5–7 working days.
- Cash on Delivery, UPI, and card payments accepted.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const supabase = await createClient();

        // Extract last user message text
        const lastUserText = [...messages]
            .reverse()
            .find((m: any) => m.role === "user")
            ?.parts?.find((p: any) => p.type === "text")?.text as string ?? "";

        const lower = lastUserText.toLowerCase();

        // ── 1. Order context (injected if user asks about orders) ──
        let orderContext = "";
        if (/order|purchase|bought|delivery|status|track|cancel|invoice|shipped|return/i.test(lower)) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: orders } = await supabase
                    .from("orders")
                    .select("id, status, total, created_at, payment_status")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (orders?.length) {
                    orderContext = `\n\n## USER'S RECENT ORDERS\n` +
                        orders.map(o =>
                            `- Order #${o.id.slice(0, 8).toUpperCase()} | Status: **${o.status}** | ₹${o.total} | ${o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : ""}`
                        ).join("\n");
                } else {
                    orderContext = "\n\nThe user has no orders yet.";
                }
            } else {
                orderContext = "\n\nThe user is not logged in — cannot show order data. Ask them to sign in at the top-right.";
            }
        }

        // ── 2. Product context (injected if user asks about a product/recipe) ──
        let productContext = "";
        const isRecipeOrProductQuery = !/order|status|track|cancel|return|refund|coupon|loyalty|points|profile|address|account|shipping|policy/i.test(lower);
        if (isRecipeOrProductQuery && lastUserText.trim().length > 2) {
            // Take meaningful words from the query
            const keyword = lower
                .replace(/can you|please|find|search|do you have|show me|i want|i need|what about|looking for|is there any|available/g, "")
                .trim()
                .split(/\s+/)
                .slice(0, 4)
                .join(" ")
                .trim();

            if (keyword.length > 2) {
                const { data: products } = await supabase
                    .from("products")
                    .select("name, price, stock, unit")
                    .ilike("name", `%${keyword}%`)
                    .eq("is_active", true)
                    .limit(8);

                if (products?.length) {
                    productContext = `\n\n## MATCHING PRODUCTS IN STORE\n` +
                        products.map(p =>
                            `- **${p.name}** — ₹${p.price}/${p.unit}${(p.stock ?? 0) > 0 ? " ✓ In stock" : " ✗ Out of stock"}`
                        ).join("\n");
                }
            }
        }

        const systemPrompt = `You are **FreshMart AI Concierge** — a knowledgeable, friendly assistant for FreshMart, an online grocery delivery app.

You have complete knowledge about the FreshMart website and can help with:
- Finding products and checking availability
- Explaining how to navigate the website
- Answering questions about orders, returns, refunds, policies
- Suggesting recipes or cooking ideas using store products
- Explaining loyalty rewards, coupons, referrals

RULES:
1. Answer concisely (2–5 sentences). Use Markdown for lists or tables.
2. If you have live product or order data below, use it — do not make up prices or statuses.
3. Use ₹ for all prices. Be warm and helpful.
4. Never discuss admin-level data (other customers' orders, revenue, stock management).
5. For anything you can't answer, direct the user to /contact or /faq.

${SITE_KNOWLEDGE}${orderContext}${productContext}`;

        const modelMessages = await convertToModelMessages(messages);

        for (const modelId of CHAT_MODELS) {
            try {
                const result = streamText({
                    model: openrouter(modelId),
                    system: systemPrompt,
                    messages: modelMessages,
                    maxOutputTokens: 500,
                });
                return result.toUIMessageStreamResponse();
            } catch (err: any) {
                const status = err?.statusCode ?? err?.status ?? 0;
                if (status !== 429 && status !== 404 && status < 500) throw err;
                console.warn(`Chat model ${modelId} failed (${status}), trying next...`);
            }
        }

        return new Response("All AI models are currently unavailable. Please try again shortly.", { status: 503 });
    } catch (error) {
        console.error("Chat API Error:", error);
        return new Response("An error occurred", { status: 500 });
    }
}
