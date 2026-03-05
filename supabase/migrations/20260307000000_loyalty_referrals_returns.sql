-- ============================================================
-- Loyalty Points, Referral System, and Return/Refund Requests
-- ============================================================

-- ─── Loyalty Points ─────────────────────────────────────────

-- Add loyalty_points column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;

-- Loyalty transactions ledger
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL, -- positive = earned, negative = redeemed
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'referral_bonus', 'expired', 'refund_credit')),
  description TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON public.loyalty_transactions(user_id);

-- RLS for loyalty_transactions
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Users can view own loyalty transactions"
  ON public.loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Admins can manage all loyalty transactions"
  ON public.loyalty_transactions FOR ALL
  USING (public.is_admin());

-- ─── Referrals ──────────────────────────────────────────────

-- Add referral_code to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate referral codes for existing users that don't have one
-- Uses first 8 chars of their UUID as a simple unique code
UPDATE public.profiles
SET referral_code = UPPER(SUBSTRING(id::text FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Referral tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id) -- each user can only be referred once
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Admins can manage all referrals" ON public.referrals;
CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL
  USING (public.is_admin());

-- ─── Return / Refund Requests ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('damaged', 'wrong_item', 'quality', 'missing_item', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  refund_amount NUMERIC,
  admin_notes TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_user ON public.return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_order ON public.return_requests(order_id);

-- RLS for return_requests
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own return requests" ON public.return_requests;
CREATE POLICY "Users can view own return requests"
  ON public.return_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own return requests" ON public.return_requests;
CREATE POLICY "Users can create own return requests"
  ON public.return_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all return requests" ON public.return_requests;
CREATE POLICY "Admins can manage all return requests"
  ON public.return_requests FOR ALL
  USING (public.is_admin());

-- Auto-generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_generate_referral ON public.profiles;
CREATE TRIGGER on_profile_generate_referral
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Function to award loyalty points on order delivery
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 1 point per ₹10 spent when order is delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    INSERT INTO public.loyalty_transactions (user_id, points, type, description, order_id)
    VALUES (
      NEW.user_id,
      GREATEST(1, FLOOR(NEW.total / 10)::integer),
      'earned',
      'Points earned from order #' || SUBSTRING(NEW.id::text FROM 1 FOR 8),
      NEW.id
    );
    UPDATE public.profiles
    SET loyalty_points = loyalty_points + GREATEST(1, FLOOR(NEW.total / 10)::integer)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_order_delivered_loyalty ON public.orders;
CREATE TRIGGER on_order_delivered_loyalty
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.award_loyalty_points();
