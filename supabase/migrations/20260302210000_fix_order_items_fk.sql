-- Fix order_items schema to ensure foreign key relationships exist
-- This resolves the "PGRST200" error where Supabase cannot find the relationship

BEGIN;

-- 1. Ensure product_id is UUID (if it was created as TEXT by a previous migration)
ALTER TABLE public.order_items 
ALTER COLUMN product_id TYPE UUID USING product_id::UUID;

-- 2. Add Foreign Key constraint to products table
-- Check if constraint exists effectively or just add it (namespaced to avoid 'relation already exists' error if run blindly, but safe here)
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

-- 3. Ensure variant_id column exists (for completeness with TypeScript types)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_id') THEN
        ALTER TABLE public.order_items
        ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;
