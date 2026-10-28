-- surFriends Day 2: schema, RLS, storage, realtime

-- ========== Tables ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner','intermediate','advanced','pro')),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.beaches (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced'))
);

CREATE TABLE public.user_favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  beach_id INT REFERENCES public.beaches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, beach_id)
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  beach_id INT NOT NULL REFERENCES public.beaches(id),
  text TEXT NOT NULL CHECK (length(text) <= 500),
  image_url TEXT,
  wave_rating SMALLINT CHECK (wave_rating BETWEEN 1 AND 5),
  wave_height_estimate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_created ON public.reports(created_at DESC);
CREATE INDEX idx_reports_beach ON public.reports(beach_id, created_at DESC);

CREATE TABLE public.replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (length(text) <= 200),
  quick_reaction TEXT CHECK (quick_reaction IS NULL OR quick_reaction IN ('coming','on_the_way')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_replies_report ON public.replies(report_id, created_at);

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK indexes used in filters / cascades
CREATE INDEX idx_reports_user ON public.reports(user_id);
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX idx_user_favorites_beach ON public.user_favorites(beach_id);

-- ========== Profile auto-creation ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
      NULLIF(pg_catalog.split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'Surfer'
    ),
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for users that already exist (e.g. Day 1 login)
INSERT INTO public.profiles (id, display_name, avatar_url)
SELECT
  u.id,
  COALESCE(
    NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(u.raw_user_meta_data ->> 'name', ''),
    NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''),
    'Surfer'
  ),
  COALESCE(
    NULLIF(u.raw_user_meta_data ->> 'avatar_url', ''),
    NULLIF(u.raw_user_meta_data ->> 'picture', '')
  )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ========== RLS ==========
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Anyone can read beaches" ON public.beaches
  FOR SELECT USING (true);

CREATE POLICY "Users read own favorites" ON public.user_favorites
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users add own favorites" ON public.user_favorites
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own favorites" ON public.user_favorites
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Anyone can read reports" ON public.reports
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can create own reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own reports" ON public.reports
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Anyone can read replies" ON public.replies
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can reply as self" ON public.replies
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own replies" ON public.replies
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users read own push subscriptions" ON public.push_subscriptions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users add own push subscriptions" ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own push subscriptions" ON public.push_subscriptions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- ========== Storage ==========
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images', 'report-images', true, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public read report images" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-images');
CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'report-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY "Users delete own report images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'report-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ========== Realtime ==========
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports, public.replies;
