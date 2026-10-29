-- surFriends: anonymous sessions instead of Google login. Run manually in the SQL Editor. Safe to re-run.
-- Prerequisite (dashboard): Authentication -> Sign In / Providers -> enable "Allow anonymous sign-ins".

-- ========== 1. profiles.name_chosen ==========
-- false = the user has not yet picked a name in the onboarding step (the app blocks the UI until they do).
-- Existing (Google) users are backfilled to true ONLY when the column is first created (re-run safe).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name_chosen'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name_chosen boolean NOT NULL DEFAULT false;
    UPDATE public.profiles SET name_chosen = true;
  END IF;
END $$;

-- Simplest safe option: extend the column-level UPDATE grant (display_name, skill_level, bio) with name_chosen.
-- RLS still limits the write to the user's own row, and the flag is purely a UX marker (no authz depends on it),
-- so a user flipping it themselves is harmless. updateProfile() sets it to true whenever a name is saved.
GRANT UPDATE (name_chosen) ON public.profiles TO authenticated;

-- ========== 2. handle_new_user: anonymous users get the default name ==========
-- Anonymous sign-ins have email NULL and empty metadata -> 'גולש/ת' (6 chars, passes the 2-40 CHECK).
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
      CASE WHEN NEW.email IS NULL THEN 'גולש/ת' ELSE 'Surfer' END
  )), 40);
  IF pg_catalog.char_length(pg_catalog.btrim(v_name)) < 2 THEN
    v_name := CASE WHEN NEW.email IS NULL THEN 'גולש/ת' ELSE 'Surfer' END;
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
