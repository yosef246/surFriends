-- Day 7: 12-hour TTL for reports. Keep in sync with REPORT_TTL_HOURS in lib/reports.ts.
-- Replies go with their report (replies.report_id ... ON DELETE CASCADE, see init_schema).
-- Storage files are NOT deleted here (deleting storage.objects rows leaves the files behind);
-- the /api/cron/purge-images route removes them through the Storage API.

-- If this errors, enable pg_cron under Dashboard -> Database -> Extensions, then re-run.
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.purge_expired_reports()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  n integer;
BEGIN
  DELETE FROM public.reports WHERE created_at < now() - interval '12 hours';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

ALTER FUNCTION public.purge_expired_reports() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.purge_expired_reports() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_reports() TO service_role;  -- route backup

CREATE OR REPLACE FUNCTION public.expired_report_image_paths(limit_count int DEFAULT 1000)
RETURNS TABLE(name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'report-images'
    AND o.created_at < now() - interval '12 hours'
  ORDER BY o.created_at
  LIMIT greatest(limit_count, 0);
$$;

ALTER FUNCTION public.expired_report_image_paths(int) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.expired_report_image_paths(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expired_report_image_paths(int) TO service_role;

-- Hourly schedule, idempotent.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'surfriends-purge-expired-reports') THEN
    PERFORM cron.unschedule('surfriends-purge-expired-reports');
  END IF;
END $$;

SELECT cron.schedule('surfriends-purge-expired-reports', '0 * * * *', $$select public.purge_expired_reports()$$);
