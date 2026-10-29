-- surFriends Day 7 hardening (QA: BUG-001, BUG-005, BUG-008, BUG-018).
-- Run manually in the SQL Editor of the hosted project. Safe to re-run (idempotent).
-- Rows written from the SQL Editor (postgres role, auth.uid() IS NULL) are exempt from the
-- trigger rules below, so supabase/dev/sample_reports.sql keeps working.

-- ========== BUG-008: created_at NOT NULL ==========
UPDATE public.reports SET created_at = NOW() WHERE created_at IS NULL;
UPDATE public.replies SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE public.reports ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.replies ALTER COLUMN created_at SET NOT NULL;

-- ========== BUG-001 + BUG-005: insert guard triggers ==========
-- Why a trigger and not column GRANTs: RLS WITH CHECK cannot restrict *which* columns a client
-- sets, and a column-level GRANT would silently break any future column the app inserts.
-- A BEFORE INSERT trigger lets us (a) overwrite created_at with the server clock so a client can
-- never pin a report to the top of the feed or break the keyset cursor, and (b) rate limit.
-- UPDATE is already impossible for clients: reports/replies have no UPDATE policy (RLS denies
-- by default), so created_at cannot be changed after insert either.
-- SECURITY INVOKER is enough: "Anyone can read" SELECT policies let the caller count rows.
-- Not race-proof under heavy concurrency (two parallel inserts can overshoot by a few); fine for abuse control.

CREATE OR REPLACE FUNCTION public.guard_report_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.created_at := pg_catalog.now();
    IF (SELECT pg_catalog.count(*) FROM public.reports r
        WHERE r.user_id = NEW.user_id
          AND r.created_at > pg_catalog.now() - INTERVAL '1 hour') >= 10 THEN
      RAISE EXCEPTION 'rate_limit_reports' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_reply_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.created_at := pg_catalog.now();
    IF (SELECT pg_catalog.count(*) FROM public.replies r
        WHERE r.user_id = NEW.user_id
          AND r.created_at > pg_catalog.now() - INTERVAL '1 hour') >= 30 THEN
      RAISE EXCEPTION 'rate_limit_replies' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_report_insert() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.guard_reply_insert() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS reports_guard_insert ON public.reports;
CREATE TRIGGER reports_guard_insert
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.guard_report_insert();

DROP TRIGGER IF EXISTS replies_guard_insert ON public.replies;
CREATE TRIGGER replies_guard_insert
  BEFORE INSERT ON public.replies
  FOR EACH ROW EXECUTE FUNCTION public.guard_reply_insert();

-- ========== BUG-001: CHECK constraints on reports ==========
-- The sample data used 'מעל הראש', which is not an allowed value (lib/reports.ts WAVE_HEIGHTS has 'ראש').
UPDATE public.reports SET wave_height_estimate = 'ראש' WHERE wave_height_estimate = 'מעל הראש';

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_wave_height_allowed;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_wave_height_allowed
  CHECK (wave_height_estimate IS NULL OR wave_height_estimate IN ('קרסול','ברך','מותן','כתף','ראש'))
  NOT VALID;

-- image_url must be an https Supabase Storage public URL pointing into the author's OWN folder:
--   https://<ref>.supabase.co/storage/v1/object/public/report-images/<user_id>/<uuid>.jpg
-- The project ref is not hardcoded (so no secret/URL lives in git); the host is limited to *.supabase.co.
-- Residual: a URL on ANOTHER Supabase project would pass; the app also checks the host before rendering.
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_image_url_own_folder;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_image_url_own_folder
  CHECK (
    image_url IS NULL
    OR image_url ~ ('^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/report-images/'
                    || user_id::text
                    || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$')
  )
  NOT VALID;

-- ========== BUG-018: same "blank text" rule as the app (space, tab, CR, LF) ==========
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_text_or_rating;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_text_or_rating
  CHECK (
    (text IS NOT NULL AND length(btrim(text, E' \t\r\n')) > 0)
    OR wave_rating IS NOT NULL
  )
  NOT VALID;

ALTER TABLE public.replies DROP CONSTRAINT IF EXISTS replies_text_or_reaction;
ALTER TABLE public.replies
  ADD CONSTRAINT replies_text_or_reaction
  CHECK (
    (text IS NOT NULL AND length(btrim(text, E' \t\r\n')) > 0)
    OR quick_reaction IS NOT NULL
  )
  NOT VALID;

-- NOT VALID constraints already apply to every new/changed row. Try to validate existing rows too;
-- if some old row violates a rule, keep going (a NOTICE is printed) instead of failing the migration.
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conrelid::regclass AS tbl, conname FROM pg_constraint
    WHERE conname IN ('reports_wave_height_allowed','reports_image_url_own_folder',
                      'reports_text_or_rating','replies_text_or_reaction')
      AND NOT convalidated
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', c.tbl, c.conname);
    EXCEPTION WHEN check_violation THEN
      RAISE NOTICE 'constraint % left NOT VALID: existing rows violate it', c.conname;
    END;
  END LOOP;
END $$;

-- ========== BUG-005: storage upload quota + JPEG only ==========
-- The client always re-encodes to JPEG, so only image/jpeg is accepted.
UPDATE storage.buckets SET allowed_mime_types = ARRAY['image/jpeg'] WHERE id = 'report-images';

-- Max 20 uploads per user per hour into report-images (on top of the own-folder rule).
DROP POLICY IF EXISTS "Users upload to own folder" ON storage.objects;
CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'report-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND (
      SELECT count(*) FROM storage.objects o
      WHERE o.bucket_id = 'report-images'
        AND (storage.foldername(o.name))[1] = (SELECT auth.uid())::text
        AND o.created_at > now() - INTERVAL '1 hour'
    ) < 20
  );
