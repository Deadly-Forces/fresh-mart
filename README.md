# Fresh Mart

Fresh Mart is a full-stack grocery commerce app built with Next.js, Supabase, and Tailwind CSS. It includes a customer storefront, authenticated profile and checkout flows, role-based operations screens for admins and delivery staff, and AI-assisted tooling for search, support, merchandising, and retention.

## What This Repo Includes

- Storefront browsing for categories, products, search, wishlist, cart, checkout, blog, stores, and static policy pages.
- Authenticated customer flows for onboarding, addresses, orders, returns, referrals, loyalty, reviews, and notification preferences.
- Admin surfaces for products, categories, orders, returns, users, coupons, banners, reviews, analytics, wishlists, loyalty, referrals, notifications, picker, and rider workflows.
- AI endpoints for cooking assistance, semantic search, vision search, support triage, review summaries, fraud scoring, predictive reordering, win-back campaigns, dynamic pricing, inventory forecasting, and catalog tooling.
- Product seeding, category reclassification, and product-image maintenance scripts.

## Stack

- `Next.js 16` with the App Router
- `React 19`
- `Tailwind CSS`
- `Supabase` for auth, database, storage, and typed schema access
- `Zustand` for cart and wishlist state
- `OpenRouter` for chat and multimodal AI flows
- `OpenAI embeddings` for product embedding generation
- `web-push` for browser push notifications

## App Areas

- Public storefront: `/`, `/shop`, `/category/[slug]`, `/product/[slug]`, `/search`, `/blog`, `/stores`, and informational pages.
- Customer-only flows: `/checkout`, `/profile`, `/wishlist`, `/notifications`, and `/assistant`.
- Admin-only area: `/admin/*`
- Operations area for delivery staff and admins: `/picker` and `/rider`

Route protection and onboarding gates are enforced in [src/proxy.ts](/E:/Programming/Projects/Grocery/fresh-mart/src/proxy.ts).

## Current Product Data Flow

This repo has two product data layers, and it is important to keep them straight:

- The live website reads products from Supabase through [src/lib/supabase/products.ts](/E:/Programming/Projects/Grocery/fresh-mart/src/lib/supabase/products.ts).
- [src/features/products/utils/products.json](/E:/Programming/Projects/Grocery/fresh-mart/src/features/products/utils/products.json) is the source dataset used for seeding and some local AI/product tooling.
- The cooking assistant route also reads `products.json` to build its prompt context.

That means editing `products.json` alone does not update the live storefront. After catalog changes, you must either reseed Supabase or apply targeted live updates.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root.

3. Provision a Supabase project and apply the SQL in [supabase/migrations](/E:/Programming/Projects/Grocery/fresh-mart/supabase/migrations).

4. If your database is empty, seed the catalog:

```bash
node scripts/seed.mjs
```

5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

## Environment Variables

Core app:

- `NEXT_PUBLIC_APP_URL`: Base URL used for redirects, sitemap, and auth callback flows.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key for browser and server session flows.
- `SUPABASE_SERVICE_ROLE_KEY`: Needed for admin-side operations, embeddings, and maintenance scripts.

AI:

- `OPENROUTER_API_KEY`: Enables assistant, support, search, pricing, and other OpenRouter-backed features.
- `OPENROUTER_MODEL`: Primary chat model.
- `OPENROUTER_FALLBACK_MODEL`: Fallback chat model.
- `OPENROUTER_MULTIMODAL_MODEL`: Used by multimodal routes such as review-summary and vision-search flows.
- `OPENAI_API_KEY`: Optional. Enables real embeddings; without it, development falls back to dummy vectors.

Push notifications:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Scheduled or protected internal routes:

- `CRON_SECRET`: Protects cron-like AI endpoints such as dynamic pricing, predictive reorder, inventory forecast, and win-back campaigns.

Optional tooling:

- `ANALYZE=true`: Enables the Next bundle analyzer.
- `PRODUCT_IMAGE_TIMEOUT_MS`: Overrides product image script request timeout.
- `PRODUCT_IMAGE_REPORT_PATH`: Overrides the image search report output path.

## Useful Commands

App commands:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
```

Catalog and operations:

```bash
node scripts/seed.mjs
node scripts/analyze-categories.js
node scripts/reclassify_live_product_categories.mjs
node scripts/reclassify_live_product_categories.mjs --apply
node scripts/sync-product-images.mjs
node scripts/sync-product-images-search.mjs
```

## Catalog Maintenance Notes

- [scripts/seed.mjs](/E:/Programming/Projects/Grocery/fresh-mart/scripts/seed.mjs) is destructive. It deletes `order_items`, `products`, and `categories` before reloading from `products.json`.
- [scripts/reclassify_live_product_categories.mjs](/E:/Programming/Projects/Grocery/fresh-mart/scripts/reclassify_live_product_categories.mjs) is for targeted live category fixes without a full reseed.
- [scripts/generate_real_products.py](/E:/Programming/Projects/Grocery/fresh-mart/scripts/generate_real_products.py), [scripts/expand_new_categories.mjs](/E:/Programming/Projects/Grocery/fresh-mart/scripts/expand_new_categories.mjs), and [scripts/fill_gap_products.mjs](/E:/Programming/Projects/Grocery/fresh-mart/scripts/fill_gap_products.mjs) shape the source catalog.
- Product images live under [public/product-images](/E:/Programming/Projects/Grocery/fresh-mart/public/product-images) and have dedicated audit/sync scripts under [scripts](/E:/Programming/Projects/Grocery/fresh-mart/scripts).

## Checkout and Payments

Checkout, address handling, promotions, and order creation are implemented, but the current payment UI is cash-on-delivery only.

## Repo Map

- [src/app](/E:/Programming/Projects/Grocery/fresh-mart/src/app): App Router routes, API routes, layouts, and role-based sections
- [src/features](/E:/Programming/Projects/Grocery/fresh-mart/src/features): domain features such as products, checkout, profile, reviews, notifications, admin, and assistant
- [src/lib](/E:/Programming/Projects/Grocery/fresh-mart/src/lib): Supabase clients, AI helpers, embeddings, push notification helpers, and shared utilities
- [scripts](/E:/Programming/Projects/Grocery/fresh-mart/scripts): seeding, catalog maintenance, analysis, and image tooling
- [supabase](/E:/Programming/Projects/Grocery/fresh-mart/supabase): local Supabase config and SQL migrations

## Development Notes

- The home page is statically revalidated every 60 seconds and pulls featured products from Supabase.
- Security headers and image remote patterns are configured in [next.config.ts](/E:/Programming/Projects/Grocery/fresh-mart/next.config.ts).
- If you are debugging catalog issues, verify whether you are looking at `products.json` or the live Supabase `products` table before making changes.
