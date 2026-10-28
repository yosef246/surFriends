# surFriends — הגדרה ידנית ליום 2

מחילים את הסכמה (טבלאות, RLS, Storage, Realtime) ואת 12 החופים על פרויקט Supabase המאוחסן.

## 1. הרצת המיגרציה

1. פתח את https://supabase.com/dashboard, בחר את הפרויקט, ואז **SQL Editor → New query**.
2. פתח את הקובץ `supabase/migrations/20261028000000_init_schema.sql`, העתק את **כל** התוכן, הדבק ב-Editor ולחץ **Run**.
3. צפוי: `Success. No rows returned`.
4. **להריץ פעם אחת בלבד.** הרצה שנייה תיכשל (הטבלאות כבר קיימות), וזה תקין.
   אם הרצה נכשלה באמצע, כל ה-Editor רץ כטרנזקציה אחת ולכן שום דבר לא נשמר. תקן ורוץ שוב.

## 2. הרצת ה-Seed

1. **New query** חדש.
2. העתק את כל `supabase/seed.sql`, הדבק ולחץ **Run**.
3. אפשר להריץ שוב בבטחה (`ON CONFLICT (slug) DO NOTHING`).

## 3. בדיקות

הרץ כל שאילתה ב-SQL Editor.

```sql
-- צפוי: 12
select count(*) from public.beaches;

-- צפוי: שורה אחת לפחות, עם השם והתמונה מגוגל
select id, display_name, avatar_url from public.profiles;

-- צפוי: rowsecurity = true לכל 6 הטבלאות
select tablename, rowsecurity from pg_tables
where schemaname = 'public' order by tablename;

-- צפוי: bucket אחד, public=true, file_size_limit=5242880
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'report-images';

-- צפוי: reports ו-replies
select tablename from pg_publication_tables where pubname = 'supabase_realtime';
```

אם `profiles` ריק למרות שהתחברת ביום 1, התחבר שוב דרך האפליקציה ובדוק שוב.

## הערות

- ה-SQL Editor רץ כ-`postgres`, ולכן ה-seed עוקף RLS. לטבלת `beaches` אין policies לכתיבה בכוונה.
- `.env.local` לא משתנה ביום 2.
