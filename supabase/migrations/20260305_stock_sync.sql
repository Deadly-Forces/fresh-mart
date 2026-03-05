-- ============================================================
-- Migration: Update RPC function for atomic order creation
-- Date: 2026-03-05
--
-- This function creates an order and its items in a single 
-- transaction, and now also decrements product stock.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order_with_items(
    p_address_id UUID,
    p_delivery_slot TEXT,
    p_payment_method TEXT,
    p_total NUMERIC,
    p_substitution_preference TEXT DEFAULT 'best_match',
    p_applied_promocode TEXT DEFAULT NULL,
    p_discount_amount NUMERIC DEFAULT 0,
    p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_order_id UUID;
    v_item JSONB;
    v_payment_status TEXT;
    v_product_id UUID;
    v_quantity INTEGER;
    v_current_stock INTEGER;
BEGIN
    -- Get the current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'User not authenticated');
    END IF;

    -- Validate inputs
    IF jsonb_array_length(p_items) = 0 THEN
        RETURN jsonb_build_object('error', 'Cannot place an empty order');
    END IF;

    -- Determine payment status
    v_payment_status := CASE WHEN p_payment_method = 'cod' THEN 'pending' ELSE 'paid' END;

    -- Create the order
    INSERT INTO public.orders (
        user_id,
        address_id,
        status,
        total,
        payment_method,
        payment_status,
        delivery_slot,
        substitution_preference,
        applied_promocode,
        discount_amount
    ) VALUES (
        v_user_id,
        p_address_id,
        'processing',
        p_total,
        p_payment_method,
        v_payment_status,
        p_delivery_slot,
        p_substitution_preference,
        p_applied_promocode,
        p_discount_amount
    )
    RETURNING id INTO v_order_id;

    -- Insert order items and decrement stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;

        -- Check and decrement stock
        SELECT stock INTO v_current_stock FROM public.products WHERE id = v_product_id FOR UPDATE;
        
        IF v_current_stock IS NULL THEN
            RAISE EXCEPTION 'Product % not found', v_product_id;
        END IF;

        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product % (Requested: %, Available: %)', v_product_id, v_quantity, v_current_stock;
        END IF;

        UPDATE public.products 
        SET stock = stock - v_quantity 
        WHERE id = v_product_id;

        -- Insert order item
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            price,
            product_snapshot
        ) VALUES (
            v_order_id,
            v_product_id,
            v_quantity,
            (v_item->>'price')::NUMERIC,
            v_item->'product_snapshot'
        );
    END LOOP;

    RETURN jsonb_build_object('success', true, 'order_id', v_order_id);

EXCEPTION WHEN OTHERS THEN
    -- Transaction automatically rolls back on exception
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_with_items TO authenticated;
