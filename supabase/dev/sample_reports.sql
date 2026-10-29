-- surFriends DEV ONLY: sample feed data. NOT a migration.
-- Run in the Supabase SQL Editor (after you have logged in once, so a profile exists).
-- Re-runnable: removes previous sample rows (texts ending with " #dev") first.
-- Reports expire after 12h (docs/DAY7_TTL.md): all timestamps below are within ~10h; re-run to refresh.
-- Remove everything: run only the DELETE statement below.

DELETE FROM public.reports WHERE text LIKE '% #dev';  -- replies go too (ON DELETE CASCADE)

DO $$
DECLARE
  uid UUID := (SELECT id FROM public.profiles ORDER BY created_at LIMIT 1);
  r1 UUID := gen_random_uuid();
  r2 UUID := gen_random_uuid();
  r3 UUID := gen_random_uuid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No profile found. Log in to the app once first.';
  END IF;

  INSERT INTO public.reports (id, user_id, beach_id, text, wave_rating, wave_height_estimate, created_at) VALUES
    (r1, uid, (SELECT id FROM public.beaches WHERE slug = 'hilton'),
      'נקי, אין אף אחד בפנים #dev', 4, 'כתף', NOW() - INTERVAL '5 minutes'),
    (r2, uid, (SELECT id FROM public.beaches WHERE slug = 'palmachim'),
      E'גלים קטנים אבל נעימים\nמתאים למתחילים #dev', 3, 'ברך', NOW() - INTERVAL '50 minutes'),
    (r3, uid, (SELECT id FROM public.beaches WHERE slug = 'keshatot-gandhi'),
      'מלא קבוצות במים, הרוח התחזקה #dev', 2, NULL, NOW() - INTERVAL '3 hours'),
    (gen_random_uuid(), uid, (SELECT id FROM public.beaches WHERE slug = 'bat-galim'),
      'סט גדול נכנס עכשיו, מעולה! #dev', 5, 'ראש', NOW() - INTERVAL '7 hours'),
    (gen_random_uuid(), uid, (SELECT id FROM public.beaches WHERE slug = 'poleg'),
      'שטוח לגמרי היום #dev', 1, NULL, NOW() - INTERVAL '9 hours'),
    (gen_random_uuid(), uid, (SELECT id FROM public.beaches WHERE slug = 'ha-sira'),
      'מישהו מגיע בערב? #dev', NULL, NULL, NOW() - INTERVAL '10 hours');

  INSERT INTO public.replies (report_id, user_id, text, quick_reaction, created_at) VALUES
    (r1, uid, NULL, 'coming', NOW() - INTERVAL '3 minutes'),
    (r1, uid, 'שומר לכם מקום', NULL, NOW() - INTERVAL '2 minutes'),
    (r2, uid, NULL, 'on_the_way', NOW() - INTERVAL '30 minutes'),
    (r3, uid, 'תודה על העדכון', NULL, NOW() - INTERVAL '2 hours');
END $$;
