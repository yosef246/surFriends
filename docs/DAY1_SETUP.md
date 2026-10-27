# surFriends — הגדרה ידנית ליום 1

שלבים שרק את/ה יכול/ה לעשות. הקוד כבר מוכן, חסרים רק המפתחות.

## 1. פרויקט Supabase
1. היכנס ל-https://supabase.com/dashboard ולחץ **New project**.
2. בחר שם (למשל `surfriends`), סיסמת DB, ואזור קרוב (למשל Frankfurt).
3. אחרי היצירה: **Project Settings → API**. העתק את:
   - Project URL
   - `anon` public key
   - `service_role` key (סודי, לא לחשוף בצד לקוח)
4. שמור את ה-`<project-ref>` (החלק לפני `.supabase.co` ב-URL).

## 2. לקוח OAuth ב-Google Cloud
1. https://console.cloud.google.com, צור פרויקט (או בחר קיים).
2. **APIs & Services → OAuth consent screen**: בחר External, מלא שם אפליקציה ואימייל. Scopes: `email`, `profile`. הוסף את עצמך כ-Test user.
3. **Credentials → Create credentials → OAuth client ID**, סוג **Web application**.
4. **Authorized redirect URIs**: `https://<project-ref>.supabase.co/auth/v1/callback`
5. שמור את ה-Client ID וה-Client Secret.

## 3. הפעלת Google ב-Supabase
1. **Authentication → Providers → Google**: הפעל (Enable).
2. הדבק Client ID ו-Client Secret ושמור.

## 4. Site URL ו-Redirect URLs
ב-**Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: הוסף `http://localhost:3000/callback`

(בפרודקשן יוסיפו כאן גם את כתובת Vercel.)

## 5. קובץ `.env.local`
```
cp .env.example .env.local
```
מלא ב-`.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `VAPID_*` — אפשר להשאיר ריק ליום 1.

## 6. הרצה ובדיקה
```
pnpm install
pnpm dev
```
1. פתח http://localhost:3000, תופנה ל-`/login`.
2. לחץ **התחברות עם Google** ובצע התחברות.
3. אחרי החזרה ל-`/` אמור להופיע השם והאימייל שלך וכפתור **התנתקות**.
4. לחץ התנתקות, ווודא שחזרת ל-`/login`.

אם נתקעת בלולאה חזרה ל-`/login`: בדוק ש-Redirect URL תואם בדיוק (`http://localhost:3000/callback`) ושהמפתחות ב-`.env.local` נכונים (הפעל מחדש את `pnpm dev` אחרי שינוי).
