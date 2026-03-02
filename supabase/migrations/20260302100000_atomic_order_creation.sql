-- ============================================================
-- Migration: Add RPC function for atomic order creation
-- Date: 2026-03-02
--
-- This function creates an order and its items in a single 
-- transaction, ensuring either all succeed or all fail.
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

    -- Insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            price,
            product_snapshot
        ) VALUES (
            v_order_id,
            (v_item->>'product_id'),
            (v_item->>'quantity')::INTEGER,
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
