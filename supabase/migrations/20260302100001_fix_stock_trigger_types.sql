-- ============================================================
-- Migration: Fix UUID/TEXT type mismatch in stock triggers
-- Date: 2026-03-02
--
-- The order_items.product_id column may be TEXT while products.id is UUID.
-- This migration ensures proper casting in the stock management triggers.
-- ============================================================

-- Fix decrement_stock_on_order to cast product_id to UUID
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = GREATEST(stock - NEW.quantity, 0)
    WHERE id = NEW.product_id::UUID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix restore_stock_on_cancel to cast product_id to UUID
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = stock + OLD.quantity
    WHERE id = OLD.product_id::UUID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
