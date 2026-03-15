CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'delivery', 'picker');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.dietary_pref AS ENUM ('veg', 'non-veg', 'vegan');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending',
    'processing',
    'manual_review',
    'confirmed',
    'packed',
    'out_for_delivery',
    'delivered',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.payment_method AS ENUM ('card', 'upi', 'wallet', 'cod');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.notification_type AS ENUM ('order_update', 'promo', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.coupon_type AS ENUM ('flat', 'percentage');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role public.user_role DEFAULT 'customer',
  is_onboarded BOOLEAN DEFAULT false,
  dietary_preference public.dietary_pref,
  country_code TEXT,
  delivery_slot TEXT,
  loyalty_points INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT,
  building TEXT,
  street TEXT,
  area TEXT,
  landmark TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  compare_price NUMERIC(12, 2),
  images TEXT[] DEFAULT '{}'::TEXT[],
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  unit TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  embedding TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  sku TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER NOT NULL,
  current_orders INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  status public.order_status DEFAULT 'pending',
  payment_method public.payment_method NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(12, 2) DEFAULT 0,
  delivery_fee NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  applied_promocode TEXT,
  delivery_slot TEXT,
  substitution_preference TEXT DEFAULT 'best_match',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12, 2) NOT NULL,
  product_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type public.coupon_type NOT NULL,
  value NUMERIC(12, 2) NOT NULL,
  description TEXT,
  min_order NUMERIC(12, 2) DEFAULT 0,
  max_discount NUMERIC(12, 2),
  max_uses INTEGER,
  per_user_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  summary TEXT,
  suggested_action TEXT,
  draft_response TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  items JSONB,
  images TEXT[] DEFAULT '{}'::TEXT[],
  admin_notes TEXT,
  refund_amount NUMERIC(12, 2),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_item_idx
  ON public.cart_items (user_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::UUID));

CREATE UNIQUE INDEX IF NOT EXISTS wishlist_user_product_idx
  ON public.wishlist (user_id, product_id);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS coupon_usage_coupon_user_idx ON public.coupon_usage (coupon_id, user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS loyalty_transactions_user_id_idx ON public.loyalty_transactions (user_id);
CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON public.referrals (referrer_id);
CREATE INDEX IF NOT EXISTS return_requests_user_id_idx ON public.return_requests (user_id);
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews (product_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Older databases created generate_referral_code() as a trigger function on
-- profiles. Drop that legacy trigger/function first so the helper version
-- below can be created without a return-type conflict.
DROP TRIGGER IF EXISTS on_profile_generate_referral ON public.profiles;
DROP FUNCTION IF EXISTS public.generate_referral_code();

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 8));
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    public.generate_referral_code()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    referral_code = COALESCE(public.profiles.referral_code, EXCLUDED.referral_code);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.has_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role::TEXT = ANY(required_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY['admin']);
$$;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE id = p_coupon_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_loyalty_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET loyalty_points = COALESCE(loyalty_points, 0) + COALESCE(p_points, 0)
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_order_inventory(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_user_id UUID;
  v_item RECORD;
BEGIN
  SELECT user_id
  INTO v_order_user_id
  FROM public.orders
  WHERE id = p_order_id;

  IF v_order_user_id IS NULL THEN
    RETURN;
  END IF;

  IF v_user_id IS DISTINCT FROM v_order_user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not allowed to restock this order.';
  END IF;

  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
      AND product_id IS NOT NULL
  LOOP
    UPDATE public.products
    SET stock = stock + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_total_stock()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(stock), 0)::BIGINT
  FROM public.products
  WHERE is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.auto_advance_orders()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET
    status = CASE
      WHEN created_at <= NOW() - INTERVAL '3 minutes' THEN 'confirmed'::public.order_status
      ELSE 'processing'::public.order_status
    END,
    payment_status = 'pending',
    updated_at = NOW()
  WHERE status IN ('pending', 'processing')
    AND (
      status IS DISTINCT FROM CASE
        WHEN created_at <= NOW() - INTERVAL '3 minutes' THEN 'confirmed'::public.order_status
        ELSE 'processing'::public.order_status
      END
      OR payment_status IS DISTINCT FROM 'pending'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.match_products(
  query_embedding TEXT,
  match_threshold DOUBLE PRECISION,
  match_count INTEGER
)
RETURNS TABLE (
  description TEXT,
  id UUID,
  images TEXT[],
  name TEXT,
  price NUMERIC,
  similarity DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.description,
    p.id,
    COALESCE(p.images, '{}'::TEXT[]),
    p.name,
    p.price,
    0.0::DOUBLE PRECISION AS similarity
  FROM public.products AS p
  WHERE false
  LIMIT GREATEST(match_count, 0);
$$;

CREATE OR REPLACE FUNCTION public.create_order_with_items(
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

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER set_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER set_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_return_requests_updated_at ON public.return_requests;
CREATE TRIGGER set_return_requests_updated_at
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_staff" ON public.profiles;
CREATE POLICY "profiles_select_own_or_staff"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.has_role(ARRAY['admin', 'picker', 'delivery'])
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_select_owner_or_staff" ON public.addresses;
CREATE POLICY "addresses_select_owner_or_staff"
  ON public.addresses FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(ARRAY['admin', 'picker', 'delivery'])
  );

DROP POLICY IF EXISTS "addresses_insert_owner" ON public.addresses;
CREATE POLICY "addresses_insert_owner"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_update_owner_or_admin" ON public.addresses;
CREATE POLICY "addresses_update_owner_or_admin"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_delete_owner_or_admin" ON public.addresses;
CREATE POLICY "addresses_delete_owner_or_admin"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "categories_public_select" ON public.categories;
CREATE POLICY "categories_public_select"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "categories_admin_manage" ON public.categories;
CREATE POLICY "categories_admin_manage"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_public_select" ON public.products;
CREATE POLICY "products_public_select"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "products_staff_update" ON public.products;
CREATE POLICY "products_staff_update"
  ON public.products FOR UPDATE
  USING (public.has_role(ARRAY['admin', 'picker', 'delivery']))
  WITH CHECK (public.has_role(ARRAY['admin', 'picker', 'delivery']));

DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
CREATE POLICY "products_admin_insert"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
CREATE POLICY "products_admin_delete"
  ON public.products FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "product_variants_public_select" ON public.product_variants;
CREATE POLICY "product_variants_public_select"
  ON public.product_variants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "product_variants_admin_manage" ON public.product_variants;
CREATE POLICY "product_variants_admin_manage"
  ON public.product_variants FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "cart_items_manage_own" ON public.cart_items;
CREATE POLICY "cart_items_manage_own"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delivery_slots_public_select" ON public.delivery_slots;
CREATE POLICY "delivery_slots_public_select"
  ON public.delivery_slots FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "delivery_slots_admin_manage" ON public.delivery_slots;
CREATE POLICY "delivery_slots_admin_manage"
  ON public.delivery_slots FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_select_owner_or_staff" ON public.orders;
CREATE POLICY "orders_select_owner_or_staff"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(ARRAY['admin', 'picker', 'delivery'])
  );

DROP POLICY IF EXISTS "orders_insert_owner" ON public.orders;
CREATE POLICY "orders_insert_owner"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_update_owner_or_staff" ON public.orders;
CREATE POLICY "orders_update_owner_or_staff"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.has_role(ARRAY['admin', 'picker', 'delivery'])
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.has_role(ARRAY['admin', 'picker', 'delivery'])
  );

DROP POLICY IF EXISTS "order_items_select_owner_or_staff" ON public.order_items;
CREATE POLICY "order_items_select_owner_or_staff"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
    OR public.has_role(ARRAY['admin', 'picker', 'delivery'])
  );

DROP POLICY IF EXISTS "order_items_insert_owner_or_admin" ON public.order_items;
CREATE POLICY "order_items_insert_owner_or_admin"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "coupons_select_active_or_admin" ON public.coupons;
CREATE POLICY "coupons_select_active_or_admin"
  ON public.coupons FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "coupons_insert_authenticated" ON public.coupons;
CREATE POLICY "coupons_insert_authenticated"
  ON public.coupons FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "coupons_admin_update" ON public.coupons;
CREATE POLICY "coupons_admin_update"
  ON public.coupons FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "coupons_admin_delete" ON public.coupons;
CREATE POLICY "coupons_admin_delete"
  ON public.coupons FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "coupon_usage_select_own_or_admin" ON public.coupon_usage;
CREATE POLICY "coupon_usage_select_own_or_admin"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "coupon_usage_insert_own_or_admin" ON public.coupon_usage;
CREATE POLICY "coupon_usage_insert_own_or_admin"
  ON public.coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "wishlist_manage_own" ON public.wishlist;
CREATE POLICY "wishlist_manage_own"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_admin_select" ON public.wishlist;
CREATE POLICY "wishlist_admin_select"
  ON public.wishlist FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "notifications_user_select" ON public.notifications;
CREATE POLICY "notifications_user_select"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_user_update" ON public.notifications;
CREATE POLICY "notifications_user_update"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_user_delete" ON public.notifications;
CREATE POLICY "notifications_user_delete"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "banners_public_select" ON public.banners;
CREATE POLICY "banners_public_select"
  ON public.banners FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "banners_admin_manage" ON public.banners;
CREATE POLICY "banners_admin_manage"
  ON public.banners FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "push_subscriptions_select_own_or_admin" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_select_own_or_admin"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_insert_own"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_update_own_or_admin" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_update_own_or_admin"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "push_subscriptions_delete_own_or_admin" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_delete_own_or_admin"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "loyalty_transactions_select_own_or_admin" ON public.loyalty_transactions;
CREATE POLICY "loyalty_transactions_select_own_or_admin"
  ON public.loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "loyalty_transactions_insert_own_or_admin" ON public.loyalty_transactions;
CREATE POLICY "loyalty_transactions_insert_own_or_admin"
  ON public.loyalty_transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "referrals_select_related_or_admin" ON public.referrals;
CREATE POLICY "referrals_select_related_or_admin"
  ON public.referrals FOR SELECT
  USING (
    auth.uid() = referrer_id
    OR auth.uid() = referred_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "referrals_insert_referred_or_admin" ON public.referrals;
CREATE POLICY "referrals_insert_referred_or_admin"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id OR public.is_admin());

DROP POLICY IF EXISTS "return_requests_select_own_or_admin" ON public.return_requests;
CREATE POLICY "return_requests_select_own_or_admin"
  ON public.return_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "return_requests_insert_own" ON public.return_requests;
CREATE POLICY "return_requests_insert_own"
  ON public.return_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "return_requests_update_admin" ON public.return_requests;
CREATE POLICY "return_requests_update_admin"
  ON public.return_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reviews_select_public_or_owner_or_admin" ON public.reviews;
CREATE POLICY "reviews_select_public_or_owner_or_admin"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_admin" ON public.reviews;
CREATE POLICY "reviews_update_admin"
  ON public.reviews FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reviews_delete_admin" ON public.reviews;
CREATE POLICY "reviews_delete_admin"
  ON public.reviews FOR DELETE
  USING (public.is_admin());

DO $$
DECLARE
  realtime_table TEXT;
BEGIN
  FOREACH realtime_table IN ARRAY ARRAY[
    'orders',
    'notifications',
    'products',
    'categories',
    'profiles',
    'coupons',
    'banners',
    'wishlist',
    'order_items',
    'loyalty_transactions',
    'return_requests',
    'reviews',
    'referrals'
  ]
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
        realtime_table
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_object THEN NULL;
    END;
  END LOOP;
END $$;
