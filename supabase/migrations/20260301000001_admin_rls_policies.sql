-- Migration: Ensure admin RLS policies exist on all relevant tables
-- This covers any tables created by the 2nd migration (orders_and_addresses)
-- that may not have had admin policies.
--
-- IMPORTANT: Uses SECURITY DEFINER function public.is_admin() from init schema
-- to avoid infinite recursion on the profiles table.

-- ============================================================
-- Add 'processing' to the order_status enum if it exists
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        BEGIN
            ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;
END
$$;

-- ============================================================
-- Drop the recursive profiles policy if it was already applied
-- The init schema already has "Public profiles are viewable by everyone"
-- with USING (true), so no admin-specific SELECT policy is needed.
-- ============================================================
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- ============================================================
-- Ensure admin policies exist (using public.is_admin() to avoid recursion)
-- ============================================================
DO $$
BEGIN
    -- Orders: Admin can SELECT all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admin can view all orders'
    ) THEN
        CREATE POLICY "Admin can view all orders" ON public.orders
            FOR SELECT USING (public.is_admin());
    END IF;

    -- Orders: Admin can UPDATE all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admin can update all orders'
    ) THEN
        CREATE POLICY "Admin can update all orders" ON public.orders
            FOR UPDATE USING (public.is_admin());
    END IF;

    -- Order Items: Admin can SELECT all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Admin can view all order items'
    ) THEN
        CREATE POLICY "Admin can view all order items" ON public.order_items
            FOR SELECT USING (public.is_admin());
    END IF;

    -- Products: Admin can DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admin can delete products'
    ) THEN
        CREATE POLICY "Admin can delete products" ON public.products
            FOR DELETE USING (public.is_admin());
    END IF;

    -- Categories: Admin can DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Admin can delete categories'
    ) THEN
        CREATE POLICY "Admin can delete categories" ON public.categories
            FOR DELETE USING (public.is_admin());
    END IF;

END
$$;
