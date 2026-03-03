-- Fix orders table foreign key relationship to addresses table
-- The application code uses `addresses` table, but the foreign key might be missing or referencing a different table.
-- This creates a proper FK to enable PostgREST joins.

BEGIN;

-- 1. Drop existing constraint if it exists (regardless of name/reference) to clean up state
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_address_id_fkey;

-- 2. Add the correct constraint to `public.addresses`
ALTER TABLE public.orders
ADD CONSTRAINT orders_address_id_fkey
FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;

COMMIT;
