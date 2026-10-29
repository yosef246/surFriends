-- surFriends Day 13 (BUG-019): close the SSRF bypass on push_subscriptions. Run manually in the SQL Editor. Safe to re-run.
-- Subscriptions are written ONLY by the server (admin client) after isAllowedPushEndpoint + validateSubscription,
-- with user_id from the session. Clients keep owner SELECT / DELETE.

DROP POLICY IF EXISTS "Users add own push subscriptions" ON public.push_subscriptions;
REVOKE INSERT ON public.push_subscriptions FROM anon, authenticated;

-- No client UPDATE either (endpoint can't be changed today, but nothing in the app updates via the user client).
DROP POLICY IF EXISTS "Users update own push subscriptions" ON public.push_subscriptions;
REVOKE UPDATE ON public.push_subscriptions FROM anon, authenticated;
