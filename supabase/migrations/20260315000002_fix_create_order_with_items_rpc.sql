-- PostgREST cannot reliably resolve overloaded RPCs with overlapping
-- parameter names/defaults. Keep a single canonical signature.
DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID,
  TEXT,
  public.payment_method,
  NUMERIC,
  TEXT,
  TEXT,
  NUMERIC,
  JSONB
);

DROP FUNCTION IF EXISTS public.create_order_with_items(
  UUID,
  TEXT,
  TEXT,
  NUMERIC,
  TEXT,
  TEXT,
  NUMERIC,
  NUMERIC,
  JSONB
);

CREATE FUNCTION public.create_order_with_items(
  p_address_id UUID,
  p_delivery_slot TEXT,
  p_payment_method public.payment_method,
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
  v_user_id UUID := auth.uid();
  v_order_id UUID;
  v_item JSONB;
  v_subtotal NUMERIC := 0;
  v_delivery_fee NUMERIC := 0;
  v_product_id UUID;
  v_quantity INTEGER;
  v_price NUMERIC;
  v_product_snapshot JSONB;
  v_current_stock INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order items are required.');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.addresses
    WHERE id = p_address_id
      AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Address not found.');
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(v_item->>'product_id', '')::UUID;
    v_quantity := COALESCE((v_item->>'quantity')::INTEGER, 0);
    v_price := COALESCE((v_item->>'price')::NUMERIC, 0);
    v_product_snapshot := COALESCE(v_item->'product_snapshot', '{}'::JSONB);

    IF v_product_id IS NULL OR v_quantity <= 0 OR v_price < 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid order item payload.');
    END IF;

    SELECT stock
    INTO v_current_stock
    FROM public.products
    WHERE id = v_product_id
      AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Product no longer exists.');
    END IF;

    IF COALESCE(v_current_stock, 0) < v_quantity THEN
      RETURN jsonb_build_object('success', false, 'error', 'One or more items are out of stock.');
    END IF;

    v_subtotal := v_subtotal + (v_price * v_quantity);
  END LOOP;

  v_delivery_fee := GREATEST(COALESCE(p_total, 0) - v_subtotal + COALESCE(p_discount_amount, 0), 0);

  INSERT INTO public.orders (
    user_id,
    address_id,
    status,
    payment_method,
    payment_status,
    subtotal,
    delivery_fee,
    discount_amount,
    total,
    applied_promocode,
    delivery_slot,
    substitution_preference
  )
  VALUES (
    v_user_id,
    p_address_id,
    'pending',
    p_payment_method,
    'pending',
    v_subtotal,
    v_delivery_fee,
    COALESCE(p_discount_amount, 0),
    p_total,
    NULLIF(p_applied_promocode, ''),
    NULLIF(p_delivery_slot, ''),
    COALESCE(NULLIF(p_substitution_preference, ''), 'best_match')
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(v_item->>'product_id', '')::UUID;
    v_quantity := COALESCE((v_item->>'quantity')::INTEGER, 0);
    v_price := COALESCE((v_item->>'price')::NUMERIC, 0);
    v_product_snapshot := COALESCE(v_item->'product_snapshot', '{}'::JSONB);

    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      price,
      product_snapshot
    )
    VALUES (
      v_order_id,
      v_product_id,
      v_quantity,
      v_price,
      v_product_snapshot
    );

    UPDATE public.products
    SET stock = stock - v_quantity
    WHERE id = v_product_id;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
