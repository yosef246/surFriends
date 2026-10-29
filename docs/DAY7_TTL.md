# Day 7 — מחיקת דיווחים אחרי 12 שעות (TTL)

## מה נמחק ומתי
- **דיווחים** (`reports`) שגילם מעל 12 שעות, **והתגובות שלהם** (`replies`, נמחקות אוטומטית דרך `ON DELETE CASCADE`).
- **תמונות** ב-Storage (`report-images`) שגילן מעל 12 שעות.
- **באפליקציה**: דיווח ישן לא מוצג מיד אחרי 12 שעות (פיד, "טען עוד", סיכום חי, עיגולי חופים), בלי קשר לזמן הניקוי. הגבול מחושב בשרת (`REPORT_TTL_HOURS` ב-`lib/reports.ts`).
- **ב-DB**: `pg_cron` מריץ `purge_expired_reports()` **כל שעה** (דקה 0). דיווח יימחק אפוא תוך עד ~13 שעות.
- **תמונות**: ה-route `/api/cron/purge-images` רץ **פעם ביום ב-03:00 UTC** (Vercel Hobby מאפשר רק cron יומי; שעתי דורש Pro). תמונה יכולה לשרוד עד ~36 שעות. היא כבר לא מוצגת (הדיווח נעלם), רק תופסת מקום. ה-route גם קורא ל-`purge_expired_reports()` כגיבוי ל-pg_cron.
- למה לא מוחקים קבצים ב-SQL: מחיקת שורות מ-`storage.objects` לא מסירה את הקובץ עצמו, ולכן המחיקה נעשית דרך ה-Storage API.

## הפעלת ה-migration
1. Supabase → SQL Editor → הדביקו את `supabase/migrations/20261029020000_report_ttl_cleanup.sql` והריצו.
2. אם יש שגיאה ב-`create extension pg_cron`: Database → Extensions → הפעילו `pg_cron`, והריצו שוב (בטוח להריץ שוב, הכול idempotent).

## בדיקה
```sql
select * from cron.job;                       -- אמורה להופיע surfriends-purge-expired-reports, '0 * * * *'
select public.purge_expired_reports();        -- מחזיר מספר דיווחים שנמחקו
select * from cron.job_run_details order by start_time desc limit 5;
```
(ב-SQL Editor אתם רצים כ-postgres, לכן הקריאה מצליחה גם שה-EXECUTE לא ניתן ל-anon/authenticated.)

## בדיקת ה-route מקומית
1. צרו סוד: `openssl rand -hex 32` (PowerShell: `-join ((1..32) | % { '{0:x2}' -f (Get-Random -Max 256) })`).
2. הוסיפו ל-`.env.local`: `CRON_SECRET=<הסוד>` (ודאו ש-`SUPABASE_SERVICE_ROLE_KEY` מוגדר), והפעילו מחדש את `pnpm dev`.
3. `curl -H "Authorization: Bearer <הסוד>" http://localhost:3000/api/cron/purge-images`
   - תשובה: `{"removed":N,"batches":M,"purgedReports":K}`
   - בלי header / סוד שגוי: 401. אם `CRON_SECRET` לא מוגדר: 500.

## Vercel
Project → Settings → Environment Variables: הוסיפו `CRON_SECRET` (וגם `SUPABASE_SERVICE_ROLE_KEY`), ואז Redeploy. Vercel שולח את הסוד אוטומטית ב-`Authorization: Bearer` לפי `vercel.json`. הערה: ה-cron רץ רק ב-Production.

## נתוני הדוגמה (#dev)
דיווחי הדוגמה יימחקו גם הם אחרי 12 שעות. להחזרתם הריצו שוב את `supabase/dev/sample_reports.sql` (כל הזמנים בו בתוך ~10 שעות אחורה, כך שהפיד יציג אותם).
