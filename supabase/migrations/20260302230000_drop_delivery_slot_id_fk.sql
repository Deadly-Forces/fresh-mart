-- ============================================================
-- Migration: Drop legacy delivery_slot_id FK from orders
-- Date: 2026-03-02
--
-- The init schema created orders.delivery_slot_id as a UUID FK 
-- referencing delivery_slots(id). The app now uses a plain TEXT 
-- column "delivery_slot" (added in 20260301100000_fix_schema_gaps).
-- The old FK causes PGRST200 errors when PostgREST tries to 
-- resolve the relationship.
-- ============================================================

BEGIN;

-- Drop the old FK constraint
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_delivery_slot_id_fkey;

-- Drop the old column (no longer used by any code)
ALTER TABLE public.orders
  DROP COLUMN IF EXISTS delivery_slot_id;

COMMIT;
