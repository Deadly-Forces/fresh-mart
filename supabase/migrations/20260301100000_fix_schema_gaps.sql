-- ============================================================
-- Migration: Fix all schema gaps between DB and application code
-- Date: 2026-03-01
--
-- Issues fixed:
--   1. orders table missing columns the app inserts/reads
--   2. orders.subtotal is NOT NULL but code doesn't always provide it
--   3. promocodes table missing (promoActions.ts queries it)
--   4. coupons table missing created_at (admin page orders by it)
--   5. Cleanup: drop unused user_addresses table
--   6. Add 'picker' role to user_role enum for picker dashboard
--   7. Add full-text search index on products for shop search
--   8. Add missing updated_at columns
-- ============================================================


-- ============================================================
-- 1. Fix orders table — add missing columns the app needs
-- ============================================================

-- payment_status: used by placeOrderAction and profile page
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- delivery_slot (TEXT): code stores slot label like "morning", "afternoon"
-- (init schema had delivery_slot_id UUID FK which is a different concept)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_slot TEXT;

-- applied_promocode: stores the promo code string on the order
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS applied_promocode TEXT;

-- discount_amount: the actual discount applied (separate from init schema's `discount`)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- updated_at: for tracking order modifications
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


-- ============================================================
-- 2. Fix orders.subtotal — add if missing, make nullable with default
--    placeOrderAction only provides `total`, not `subtotal`
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
-- If the column already existed as NOT NULL, relax it
DO $$
BEGIN
  ALTER TABLE public.orders ALTER COLUMN subtotal DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================================
-- 3. Create promocodes table
--    promoActions.ts queries: code, is_active, valid_from, valid_until,
--    usage_limit, times_used, min_order_value, discount_type, discount_value,
--    max_discount
-- ============================================================

CREATE TABLE IF NOT EXISTS public.promocodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  max_discount NUMERIC,
  min_order_value NUMERIC DEFAULT 0,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for promocodes
ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Promocodes viewable by authenticated users" ON public.promocodes;
CREATE POLICY "Promocodes viewable by authenticated users"
  ON public.promocodes FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage promocodes" ON public.promocodes;
CREATE POLICY "Admins manage promocodes"
  ON public.promocodes FOR ALL
  USING (public.is_admin());

-- Realtime for promocodes
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.promocodes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 4. Add created_at to coupons table
--    Admin coupons page does .order("created_at") but column didn't exist
-- ============================================================

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- ============================================================
-- 5. Drop unused user_addresses table
--    Created by migration 20260228000000 but code only uses `addresses`
--    Keeping as a cleanup step; safe since no code references it
-- ============================================================

DROP TABLE IF EXISTS public.user_addresses CASCADE;


-- ============================================================
-- 6. Add 'picker' role to user_role enum
--    Picker dashboard exists in the app; 'delivery' exists for riders
-- ============================================================

DO $$
BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'picker';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================================
-- 7. Add GIN index on products for search performance
--    The shop page filters products by name; a trgm index helps
-- ============================================================

-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index on product name for fast ILIKE / similarity searches
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING gin (name gin_trgm_ops);

-- Index on products.slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_slug
  ON public.products USING btree (slug);

-- Index on products.category_id for join performance
CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products USING btree (category_id);

-- Index on categories.slug for fast category lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON public.categories USING btree (slug);


-- ============================================================
-- 8. Add updated_at to profiles if missing (migration 20240101000001
--    adds it, but ensure it exists)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;


-- ============================================================
-- 9. Add updated_at trigger for orders
--    Auto-update updated_at on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS promocodes_updated_at ON public.promocodes;
CREATE TRIGGER promocodes_updated_at
  BEFORE UPDATE ON public.promocodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 10. Seed sample promocodes for development
-- ============================================================

INSERT INTO public.promocodes (code, discount_type, discount_value, max_discount, min_order_value, usage_limit, valid_from, valid_until, is_active)
VALUES
  ('WELCOME10', 'percentage', 10, 15, 20, 1000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '365 days', true),
  ('FLAT5', 'fixed', 5, NULL, 30, 500, NOW() - INTERVAL '1 day', NOW() + INTERVAL '180 days', true),
  ('FRESH20', 'percentage', 20, 25, 50, 200, NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', true)
ON CONFLICT (code) DO NOTHING;
