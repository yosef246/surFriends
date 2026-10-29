-- Seanow-style beach names + CC-licensed photos (Wikimedia Commons). Idempotent.
ALTER TABLE public.beaches
  ADD COLUMN IF NOT EXISTS image_path text,
  ADD COLUMN IF NOT EXISTS image_credit text,
  ADD COLUMN IF NOT EXISTS image_license text,
  ADD COLUMN IF NOT EXISTS image_source_url text;

UPDATE public.beaches b SET name_he = v.name_he
FROM (VALUES
  ('sokolov', 'נהריה – חוף סוקולוב'),
  ('bat-galim', 'בת גלים (קזינו)'),
  ('zamir-nirvana', 'חוף זמיר (חיפה)'),
  ('sdot-yam-caesarea', 'קיסריה – שדות ים'),
  ('poleg', 'נתניה – חוף פולג'),
  ('ha-sira', 'הרצליה – חוף הסירה'),
  ('hilton', 'הילטון'),
  ('dolphinarium', 'בננה ביץ'' – דולפינריום'),
  ('palmachim', 'פלמחים'),
  ('keshatot-gandhi', 'אשדוד – חוף הקשתות'),
  ('delila', 'אשקלון – חוף דלילה'),
  ('nitzanim-zikim', 'ניצנים')
) AS v(slug, name_he)
WHERE b.slug = v.slug;

UPDATE public.beaches b SET
  image_path = v.image_path,
  image_credit = v.image_credit,
  image_license = v.image_license,
  image_source_url = v.image_source_url
FROM (VALUES
  ('sokolov', '/beaches/sokolov.jpg', 'David King', 'CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:Beach_-_Nahariya_Israel_(1370405741).jpg'),
  ('bat-galim', '/beaches/bat-galim.jpg', 'Zvi Roger', 'CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:Bat_Galim_neighborhood_and_Haifa_Bay.jpg'),
  ('zamir-nirvana', '/beaches/zamir-nirvana.jpg', 'Zvi Roger', 'CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:Haifa-WM03_-_Dado_Beach,_Haifa.JPG'),
  ('sdot-yam-caesarea', '/beaches/sdot-yam-caesarea.jpg', 'israel zeller', 'CC BY 2.5', 'https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_74907_sdot_yam_beach.jpg'),
  ('poleg', '/beaches/poleg.jpg', 'Yehudit Garinkol', 'CC BY 2.5', 'https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_6431_Israeli_Winter_Poleg_beach.JPG'),
  ('ha-sira', '/beaches/ha-sira.jpg', 'Yehudit Garinkol', 'CC BY 2.5', 'https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_31680_Herzliya_beach_at_sunset.JPG'),
  ('hilton', '/beaches/hilton.jpg', 'Martin Furtschegger', 'CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:St%C3%BCrmische_See_am_Hilton_Beach,_Tel_Aviv_-_panoramio.jpg'),
  ('dolphinarium', '/beaches/dolphinarium.jpg', 'Ariel Palmon', 'CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:Drums%27_Beach_near_the_Dolphinarium_ap_001.jpg'),
  ('palmachim', '/beaches/palmachim.jpg', 'Pavel Bernshtam', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Palmachim_beach_2,_Israel.jpg'),
  ('keshatot-gandhi', '/beaches/keshatot-gandhi.jpg', 'ענת פרנק גורלי', 'CC BY 2.5', 'https://commons.wikimedia.org/wiki/File:102887_ashdod_beach_PikiWiki_Israel.jpg'),
  ('delila', '/beaches/delila.jpg', 'דוידי ורדי', 'CC BY 2.5', 'https://commons.wikimedia.org/wiki/File:92288_ashkelon_beach_breakwaters_PikiWiki_Israel.jpg'),
  ('nitzanim-zikim', '/beaches/nitzanim-zikim.jpg', 'Rafi hirschler', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:%D7%97%D7%95%D7%A3_%D7%A0%D7%99%D7%A6%D7%A0%D7%99%D7%9D_-_%D7%9E%D7%91%D7%98_%D7%A6%D7%A4%D7%95%D7%A0%D7%94_%D7%9C%D7%9B%D7%99%D7%95%D7%95%D7%9F_%D7%90%D7%A9%D7%93%D7%95%D7%93_-_27.2.2016.jpg')
) AS v(slug, image_path, image_credit, image_license, image_source_url)
WHERE b.slug = v.slug;
