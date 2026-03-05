-- ============================================================
-- Migration: Drop redundant stock triggers
-- Date: 2026-03-05
--
-- The create_order_with_items RPC now handles stock deduction
-- manually, so the automatic triggers on order_items are redundant
-- and cause double deduction. This migration removes them.
-- ============================================================

-- Drop the triggers
DROP TRIGGER IF EXISTS trg_decrement_stock ON public.order_items;
DROP TRIGGER IF EXISTS trg_restore_stock ON public.order_items;

-- Drop the associated functions
DROP FUNCTION IF EXISTS public.decrement_stock_on_order();
DROP FUNCTION IF EXISTS public.restore_stock_on_cancel();
