-- surFriends video reports: one short video (<=10s, ~480p, compressed on-device) per report, XOR with a photo.
-- Run manually in the SQL Editor of the hosted project. Safe to re-run (idempotent).
--
-- Decisions:
--  * video_url        -> report-videos/<user_id>/<uuid>.(mp4|webm|mov)
--  * video_poster_url -> report-videos/<user_id>/<uuid>-poster.jpg   (the poster lives in the SAME bucket as the
--                        video so one TTL job / one quota covers both; report-images is not accepted for posters)
--  * Photo XOR video is enforced here (reports_one_media), not only in the app.
--  * Storage upload quota: 20 objects per user per hour in report-videos (a video report = 2 objects: the video
--    and its poster, so this matches the 10 reports/hour limit).
--  * Uploads are blocked at night (public.is_night_israel(), from the night_lockout migration). Unlike the images
--    bucket, nothing is wasted uploading ~1MB that can never be published.
--  * Playback note: .mov (HEVC from iPhone) is only accepted as the FALLBACK when on-device compression is
--    unsupported. HEVC .mov may not play on Android / some desktop browsers, which is why the client prefers
--    compressing to mp4(H.264) or webm.

-- ========== reports columns ==========
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_poster_url text,
  ADD COLUMN IF NOT EXISTS video_duration_ms integer;

-- Never both an image and a video.
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_one_media;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_one_media
  CHECK (NOT (image_url IS NOT NULL AND video_url IS NOT NULL))
  NOT VALID;

-- video_url / poster must point into the author's own folder of the report-videos bucket (mirrors image_url).
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_video_url_own_folder;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_video_url_own_folder
  CHECK (
    video_url IS NULL
    OR video_url ~ ('^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/report-videos/'
                    || user_id::text
                    || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|webm|mov)$')
  )
  NOT VALID;

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_video_poster_own_folder;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_video_poster_own_folder
  CHECK (
    video_poster_url IS NULL
    OR video_poster_url ~ ('^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/report-videos/'
                           || user_id::text
                           || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-poster\.jpg$')
  )
  NOT VALID;

-- A poster and a duration only make sense with a video, and a video always has a poster.
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_video_fields_together;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_video_fields_together
  CHECK (
    (video_url IS NULL AND video_poster_url IS NULL AND video_duration_ms IS NULL)
    OR (video_url IS NOT NULL AND video_poster_url IS NOT NULL AND video_duration_ms IS NOT NULL)
  )
  NOT VALID;

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_video_duration_range;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_video_duration_range
  CHECK (video_duration_ms IS NULL OR (video_duration_ms BETWEEN 1 AND 10500))
  NOT VALID;

-- Validate (notice fallback, same pattern as day7_hardening): new columns are NULL on old rows, so this succeeds.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conrelid::regclass AS tbl, conname FROM pg_constraint
    WHERE conname IN ('reports_one_media','reports_video_url_own_folder','reports_video_poster_own_folder',
                      'reports_video_fields_together','reports_video_duration_range')
      AND NOT convalidated
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', c.tbl, c.conname);
    EXCEPTION WHEN check_violation THEN
      RAISE NOTICE 'constraint % left NOT VALID: existing rows violate it', c.conname;
    END;
  END LOOP;
END $$;

-- ========== storage bucket ==========
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-videos', 'report-videos', true, 8388608,
  ARRAY['video/mp4','video/webm','video/quicktime','image/jpeg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read report videos" ON storage.objects;
CREATE POLICY "Public read report videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-videos');

DROP POLICY IF EXISTS "Users upload own report videos" ON storage.objects;
CREATE POLICY "Users upload own report videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'report-videos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND NOT public.is_night_israel(now())
    AND (
      SELECT count(*) FROM storage.objects o
      WHERE o.bucket_id = 'report-videos'
        AND (storage.foldername(o.name))[1] = (SELECT auth.uid())::text
        AND o.created_at > now() - INTERVAL '1 hour'
    ) < 20
  );

DROP POLICY IF EXISTS "Users delete own report videos" ON storage.objects;
CREATE POLICY "Users delete own report videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'report-videos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ========== TTL: storage paths older than 12h (called by /api/cron/purge-images) ==========
CREATE OR REPLACE FUNCTION public.expired_report_video_paths(limit_count int DEFAULT 1000)
RETURNS TABLE(name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'report-videos'
    AND o.created_at < pg_catalog.now() - interval '12 hours'
  ORDER BY o.created_at
  LIMIT greatest(limit_count, 0);
$$;

ALTER FUNCTION public.expired_report_video_paths(int) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.expired_report_video_paths(int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expired_report_video_paths(int) TO service_role;
