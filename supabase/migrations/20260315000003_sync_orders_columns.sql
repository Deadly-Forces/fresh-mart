-- Bring older hosted databases up to the schema expected by the app and RPC.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS applied_promocode TEXT,
  ADD COLUMN IF NOT EXISTS delivery_slot TEXT,
  ADD COLUMN IF NOT EXISTS substitution_preference TEXT DEFAULT 'best_match',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.orders
SET
  subtotal = COALESCE(subtotal, total, 0),
  delivery_fee = COALESCE(delivery_fee, 0),
  discount_amount = COALESCE(discount_amount, 0),
  payment_status = COALESCE(NULLIF(payment_status, ''), 'pending'),
  substitution_preference = COALESCE(NULLIF(substitution_preference, ''), 'best_match'),
  updated_at = COALESCE(updated_at, created_at, NOW())
WHERE
  subtotal IS NULL
  OR delivery_fee IS NULL
  OR discount_amount IS NULL
  OR payment_status IS NULL
  OR substitution_preference IS NULL
  OR updated_at IS NULL;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'set_updated_at'
  ) THEN
    EXECUTE $trigger$
      CREATE TRIGGER set_orders_updated_at
        BEFORE UPDATE ON public.orders
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at()
    $trigger$;
  END IF;
END;
$$;
