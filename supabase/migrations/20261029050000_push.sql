-- surFriends Day 12: Web Push. Run manually in the SQL Editor. Safe to re-run.

-- ========== 1. push_subscriptions: device info + owner UPDATE ==========
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS last_success_at TIMESTAMPTZ;

-- Owner may re-register (upsert) their own row. Rows are written by the server action;
-- the endpoint's owner moves to the signed-in user there (shared device), via the admin client,
-- because RLS correctly refuses to let user B touch a row owned by user A.
DROP POLICY IF EXISTS "Users update own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users update own push subscriptions" ON public.push_subscriptions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- Column-level grant (same philosophy as profile_hardening): the owner can't reassign user_id/endpoint.
REVOKE UPDATE ON public.push_subscriptions FROM anon, authenticated;
GRANT UPDATE (p256dh, auth, user_agent) ON public.push_subscriptions TO authenticated;

-- ========== 2. Global switch per account ==========
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN NOT NULL DEFAULT TRUE;
-- Must stay in the column-level UPDATE grant from profile_hardening (re-issued, additive).
GRANT UPDATE (display_name, skill_level, bio, push_enabled) ON public.profiles TO authenticated;

-- ========== 3. push_log: cooldown + test-push rate limit (service role only) ==========
CREATE TABLE IF NOT EXISTS public.push_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  beach_id INT,                              -- NULL for kind = 'test'
  kind TEXT NOT NULL DEFAULT 'report' CHECK (kind IN ('report', 'test')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_log_cooldown ON public.push_log (user_id, beach_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_log_sent_at ON public.push_log (sent_at);

-- RLS on, no policies: invisible to anon/authenticated; the service role bypasses RLS.
ALTER TABLE public.push_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_log FROM anon, authenticated;

-- ========== 4. Housekeeping: drop log rows older than a day (called from the existing cron) ==========
CREATE OR REPLACE FUNCTION public.purge_old_push_log()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE n INT;
BEGIN
  DELETE FROM public.push_log WHERE sent_at < pg_catalog.now() - INTERVAL '1 day';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;
REVOKE ALL ON FUNCTION public.purge_old_push_log() FROM PUBLIC, anon, authenticated;
