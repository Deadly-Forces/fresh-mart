-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index per user + endpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_user_endpoint ON push_subscriptions(user_id, endpoint);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "users_can_view_own_push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "users_can_insert_own_push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "users_can_update_own_push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "users_can_delete_own_push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "anon_can_insert_push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "admins_can_view_all_push_subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "admins_can_update_all_push_subscriptions" ON push_subscriptions;

-- RLS Policies
-- Users can view their own subscriptions
CREATE POLICY "users_can_view_own_push_subscriptions"
    ON push_subscriptions FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Users can insert their own subscriptions (authenticated must set their user_id)
CREATE POLICY "users_can_insert_own_push_subscriptions"
    ON push_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own subscriptions
CREATE POLICY "users_can_update_own_push_subscriptions"
    ON push_subscriptions FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "users_can_delete_own_push_subscriptions"
    ON push_subscriptions FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Anonymous users can create subscriptions (with null user_id)
CREATE POLICY "anon_can_insert_push_subscriptions"
    ON push_subscriptions FOR INSERT
    TO anon
    WITH CHECK (user_id IS NULL);

-- Admins can view all subscriptions
CREATE POLICY "admins_can_view_all_push_subscriptions"
    ON push_subscriptions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = (SELECT auth.uid())
            AND public.profiles.role = 'admin'
        )
    );

-- Admins can update all subscriptions
CREATE POLICY "admins_can_update_all_push_subscriptions"
    ON push_subscriptions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = (SELECT auth.uid())
            AND public.profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = (SELECT auth.uid())
            AND public.profiles.role = 'admin'
        )
    );

-- Function to update the updated_at timestamp (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Revoke execute from public roles if desired
REVOKE EXECUTE ON FUNCTION update_push_subscription_timestamp() FROM anon, authenticated;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscription_timestamp();

-- Grant necessary permissions (RLS will enforce row-level restrictions)
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT INSERT ON push_subscriptions TO anon;