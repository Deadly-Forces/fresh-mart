-- RPC function to get total stock across all active products
-- Using server-side SQL aggregation to avoid client row limits

CREATE OR REPLACE FUNCTION public.get_total_stock()
RETURNS bigint AS $$
    SELECT COALESCE(SUM(stock), 0)::bigint FROM public.products WHERE is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
