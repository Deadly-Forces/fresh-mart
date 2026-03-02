-- 1. Set all existing product stock to 200
UPDATE public.products SET stock = 200;

-- 2. Change the default stock for new products to 200
ALTER TABLE public.products ALTER COLUMN stock SET DEFAULT 200;

-- 3. Create a function that decrements stock when order_items are inserted
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = GREATEST(stock - NEW.quantity, 0)
    WHERE id = NEW.product_id::UUID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create a trigger on order_items that fires after each row insert
DROP TRIGGER IF EXISTS trg_decrement_stock ON public.order_items;
CREATE TRIGGER trg_decrement_stock
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_stock_on_order();

-- 5. (Optional) If an order item is deleted (e.g. cancellation), restore stock
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = stock + OLD.quantity
    WHERE id = OLD.product_id::UUID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_restore_stock ON public.order_items;
CREATE TRIGGER trg_restore_stock
    AFTER DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.restore_stock_on_cancel();
