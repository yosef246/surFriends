-- surFriends beaches seed (idempotent; run after the migration)
INSERT INTO public.beaches (slug, name_he, name_en, city, region, latitude, longitude, difficulty, description) VALUES
('sokolov', 'חוף סוקולוב',       'Sokolov Beach',       'נהריה',    'North',  33.0075, 35.0920, 'advanced',     'חוף סלעי ומאתגר, מתאים לגולשים מנוסים'),
('bat-galim', 'חוף בת גלים',       'Bat Galim Beach',     'חיפה',     'North',  32.8285, 34.9690, 'advanced',     'חוף סוער וותיק (קזינו ובק דור), ימי סערה וגלים גבוהים'),
('zamir-nirvana', 'חוף זמיר / נירוונה', 'Zamir / Nirvana',    'חיפה',     'North',  32.8365, 34.9775, 'intermediate', 'חוף נוח ונגיש, מועדוני גלישה פעילים'),
('sdot-yam-caesarea', 'שדות ים / קיסריה',   'Sdot Yam / Caesarea', 'קיסריה',   'Center', 32.5020, 34.8955, 'advanced',     'הסלע והארובות — נקודות שבירה בסערות, לגולשים מנוסים'),
('poleg', 'חוף פולג',           'Poleg Beach',         'נתניה',    'Center', 32.2795, 34.8445, 'beginner',     'רחב, פחות עמוס, מצוין למתחילים'),
('ha-sira', 'חוף הסירה',          'Ha-Sira Beach',       'הרצליה',   'Center', 32.1760, 34.7975, 'intermediate', 'Point Break על סלעים, רכיבה ארוכה'),
('hilton', 'חוף הילטון',         'Hilton Beach',        'תל אביב',  'Center', 32.0885, 34.7705, 'intermediate', 'המזוהה ביותר עם גלישה בישראל, שבירה עקבית לכל השנה'),
('dolphinarium', 'חוף הדולפינריום',    'Dolphinarium Beach',  'תל אביב',  'Center', 32.0725, 34.7640, 'intermediate', 'חוף היסטורי ומרכזי, פופולרי ולעיתים תחרותי'),
('palmachim', 'חוף פלמחים',         'Palmachim Beach',     'פלמחים',   'Center', 31.9280, 34.6975, 'intermediate', 'חוף טבעי ובתולי, גלים נקיים, קרקע חולית'),
('keshatot-gandhi', 'חוף הקשתות / גנדי',  'Keshatot / Gandhi',   'אשדוד',    'South',  31.8205, 34.6435, 'intermediate', 'בירת הגלישה, גלים תכופים, הגנה מרוחות דרומיות'),
('delila', 'חוף דלילה',          'Delila Beach',        'אשקלון',   'South',  31.6775, 34.5560, 'intermediate', 'ותיק, ספוט גלישה בחלק הצפוני'),
('nitzanim-zikim', 'חוף ניצנים / זיקים', 'Nitzanim / Zikim',    'אשקלון',   'South',  31.5890, 34.5185, 'beginner',     'חופים פתוחים ודרומיים, פחות עומס, מרחב גדול')
ON CONFLICT (slug) DO NOTHING;
