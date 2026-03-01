ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS substitution_preference TEXT DEFAULT 'best_match';
