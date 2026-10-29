-- surFriends beaches seed (idempotent; run after the migration)
INSERT INTO public.beaches (slug, name_he, name_en, city, region, latitude, longitude, difficulty, description) VALUES
('sokolov', 'נהריה – חוף סוקולוב',       'Sokolov Beach',       'נהריה',    'North',  33.0075, 35.0920, 'advanced',     'חוף סלעי ומאתגר, מתאים לגולשים מנוסים'),
('bat-galim', 'בת גלים (קזינו)',       'Bat Galim Beach',     'חיפה',     'North',  32.8285, 34.9690, 'advanced',     'חוף סוער וותיק (קזינו ובק דור), ימי סערה וגלים גבוהים'),
('zamir-nirvana', 'חיפה – נירוונה', 'Zamir / Nirvana',    'חיפה',     'North',  32.8365, 34.9775, 'intermediate', 'חוף נוח ונגיש, מועדוני גלישה פעילים'),
('sdot-yam-caesarea', 'קיסריה – שדות ים',   'Sdot Yam / Caesarea', 'קיסריה',   'Center', 32.5020, 34.8955, 'advanced',     'הסלע והארובות — נקודות שבירה בסערות, לגולשים מנוסים'),
('poleg', 'נתניה – חוף פולג',           'Poleg Beach',         'נתניה',    'Center', 32.2795, 34.8445, 'beginner',     'רחב, פחות עמוס, מצוין למתחילים'),
('ha-sira', 'הרצליה – חוף הסירה',          'Ha-Sira Beach',       'הרצליה',   'Center', 32.1760, 34.7975, 'intermediate', 'Point Break על סלעים, רכיבה ארוכה'),
('hilton', 'הילטון',         'Hilton Beach',        'תל אביב',  'Center', 32.0885, 34.7705, 'intermediate', 'המזוהה ביותר עם גלישה בישראל, שבירה עקבית לכל השנה'),
('dolphinarium', 'בננה ביץ'' – דולפינריום',    'Dolphinarium Beach',  'תל אביב',  'Center', 32.0725, 34.7640, 'intermediate', 'חוף היסטורי ומרכזי, פופולרי ולעיתים תחרותי'),
('palmachim', 'פלמחים',         'Palmachim Beach',     'פלמחים',   'Center', 31.9280, 34.6975, 'intermediate', 'חוף טבעי ובתולי, גלים נקיים, קרקע חולית'),
('keshatot-gandhi', 'אשדוד – חוף הקשתות',  'Keshatot / Gandhi',   'אשדוד',    'South',  31.8205, 34.6435, 'intermediate', 'בירת הגלישה, גלים תכופים, הגנה מרוחות דרומיות'),
('delila', 'אשקלון – חוף דלילה',          'Delila Beach',        'אשקלון',   'South',  31.6775, 34.5560, 'intermediate', 'ותיק, ספוט גלישה בחלק הצפוני'),
('nitzanim-zikim', 'ניצנים', 'Nitzanim / Zikim',    'אשקלון',   'South',  31.5890, 34.5185, 'beginner',     'חופים פתוחים ודרומיים, פחות עומס, מרחב גדול')
ON CONFLICT (slug) DO NOTHING;

-- Photos (Wikimedia Commons, CC) - same as migration 20261029090000; idempotent
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
