DROP POLICY IF EXISTS "newsletter_insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_select" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_update" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_delete" ON public.newsletter_subscribers;

-- Allow anyone to insert
CREATE POLICY "newsletter_insert"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select (needed for upsert conflict resolution)
CREATE POLICY "newsletter_select"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (true);

-- Allow anyone to update (needed for upsert ON CONFLICT UPDATE)
CREATE POLICY "newsletter_update"
  ON public.newsletter_subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only service role can delete
CREATE POLICY "newsletter_delete"
  ON public.newsletter_subscribers
  FOR DELETE
  USING (auth.role() = 'service_role');