-- Remove video reports (undoes 20261103010000_video_reports.sql). The app stopped supporting videos.
-- Run manually in the SQL Editor of the hosted project, AFTER the app version without videos is deployed.
-- Safe to re-run (idempotent).
--
-- The report-videos bucket and its files are NOT removed here: Supabase blocks direct deletes from the
-- storage tables. Empty and delete the bucket through the Storage API (dashboard: Storage > report-videos >
-- Empty bucket, then Delete bucket) before or after running this file.

-- ========== storage policies (closes uploads to report-videos) ==========
DROP POLICY IF EXISTS "Users upload own report videos" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own report videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read report videos" ON storage.objects;

-- ========== TTL helper ==========
DROP FUNCTION IF EXISTS public.expired_report_video_paths(int);

-- ========== reports constraints + columns ==========
ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_one_media,
  DROP CONSTRAINT IF EXISTS reports_video_url_own_folder,
  DROP CONSTRAINT IF EXISTS reports_video_poster_own_folder,
  DROP CONSTRAINT IF EXISTS reports_video_fields_together,
  DROP CONSTRAINT IF EXISTS reports_video_duration_range;

ALTER TABLE public.reports
  DROP COLUMN IF EXISTS video_url,
  DROP COLUMN IF EXISTS video_poster_url,
  DROP COLUMN IF EXISTS video_duration_ms;
