-- surFriends Day 11 (F8 profile) hardening. Run manually in the SQL Editor. Safe to re-run.

-- ========== 1. Clients may only change display_name / skill_level / bio ==========
-- RLS "Users update own profile" limits WHICH row, not WHICH columns, so a signed-in user could
-- rewrite their own id/created_at (or point avatar_url at an arbitrary URL) through REST.
-- Column-level UPDATE grant: everything else is immutable for anon/authenticated.
-- avatar_url stays server-managed (copied from Google by handle_new_user); the app never writes it.
-- SQL Editor (postgres) and SECURITY DEFINER functions are unaffected.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name, skill_level, bio) ON public.profiles TO authenticated;

-- ========== 2. Length CHECKs (mirror lib/profile.ts: name 2-40, bio <= 160) ==========
-- char_length counts code points, like the app. NOT VALID applies to every new/changed row.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_display_name_length;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_length
  CHECK (char_length(btrim(display_name)) BETWEEN 2 AND 40) NOT VALID;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bio_length;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_length
  CHECK (bio IS NULL OR char_length(bio) <= 160) NOT VALID;

-- ========== 3. Signup must not break on long / short Google names ==========
-- Same as init_schema's handle_new_user, but the name is trimmed to 40 code points (min 2).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT;
BEGIN
  v_name := pg_catalog.left(pg_catalog.btrim(COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
      NULLIF(pg_catalog.split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'Surfer'
  )), 40);
  IF pg_catalog.char_length(pg_catalog.btrim(v_name)) < 2 THEN
    v_name := 'Surfer';
  END IF;
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    v_name,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'picture', '')
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ========== 4. Validate existing rows; keep going with a NOTICE if some old row violates ==========
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conrelid::regclass AS tbl, conname FROM pg_constraint
    WHERE conname IN ('profiles_display_name_length','profiles_bio_length') AND NOT convalidated
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', c.tbl, c.conname);
    EXCEPTION WHEN check_violation THEN
      RAISE NOTICE 'constraint % left NOT VALID: existing rows violate it', c.conname;
    END;
  END LOOP;
END $$;
