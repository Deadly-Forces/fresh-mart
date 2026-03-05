-- Allow users to delete their own orders
-- order_items will be cascade-deleted automatically (ON DELETE CASCADE)

DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
CREATE POLICY "Users can delete their own orders"
    ON public.orders FOR DELETE
    USING (auth.uid() = user_id);
