-- RPC function to get total stock across all products
-- Using server-side SQL aggregation to avoid client row limits

CREATE OR REPLACE FUNCTION public.get_total_stock()
RETURNS bigint AS $$
    SELECT COALESCE(SUM(stock), 0)::bigint FROM public.products;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
