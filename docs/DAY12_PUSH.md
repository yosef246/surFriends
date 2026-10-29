# יום 12: Web Push לחופים מועדפים

## איך זה עובד
1. ב-`/settings` (או ב-`PushOptInSheet` אחרי ⭐ ראשון על חוף) לוחצים "הפעילו התראות". רק אז הדפדפן מבקש הרשאה, נרשם `public/sw.js` (scope `/`), ונוצר מנוי עם `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
2. הפעולה `subscribeToPush` מאמתת את המנוי (`lib/push.ts`) ושומרת ב-`push_subscriptions` עבור המשתמש המחובר. הכתובת (endpoint) חייבת להיות https של שירות דחיפה אמיתי (FCM, Mozilla, Apple, Windows). זו הגנת SSRF, כי השרת שולח אליה.
   אם אותו endpoint נרשם בעבר על ידי משתמש אחר (מכשיר משותף) הוא עובר למשתמש הנוכחי. זה נעשה עם ה-admin client, כי RLS בצדק לא מאפשר למשתמש B לגעת בשורה של A.
3. `createReport` מפעיל, אחרי הוספה מוצלחת בלבד, `after(() => notifyFavoriteUsers(...))`, כך שהתגובה למשתמש לא מתעכבת. `lib/push-send.ts`:
   - משתמשים שהוסיפו את החוף למועדפים, פחות המדווח, עם `profiles.push_enabled = true`, ובלי push באותו חוף ב-30 הדקות האחרונות (`push_log`);
   - שולח עם `web-push` (TTL שעתיים, urgency normal, topic `beach-<id>`), תוכן: כותרת `🌊 <שם החוף>`, גוף `<שם פרטי>: <טקסט עד 80 תווים או "גלים: <דירוג>">`, קישור `/beach/<id>`;
   - מוחק מנויים שחזרו 404/410, מעדכן `last_success_at`, כותב `push_log`. אף שגיאה לא מגיעה ל-action.
4. `public/sw.js`: `push` (מציג התראה, rtl/he, `tag` לכל חוף כדי לא לצבור), `notificationclick` (ממקד חלון קיים וניווט, או פותח חדש), `pushsubscriptionchange` (הרשמה מחדש + `POST /api/push/resubscribe`). בלי fetch ובלי cache.
5. `POST /api/push/send` (Bearer `CRON_SECRET`, השוואה בזמן קבוע): `{ "beachId": 1, "authorId"?: "uuid", "text"?: "...", "waveRating"?: 1-5 }`. אותו קוד, אותו cooldown. לבדיקות ידניות.

מתג ההתראות הוא **per-device** (הרשאה + מנוי). "השהיה בכל המכשירים" מכבה את `profiles.push_enabled` לחשבון כולו.

## המיגרציה להריץ
SQL Editor, הקובץ `supabase/migrations/20261029050000_push.sql` (בטוח להרצה חוזרת). מוסיף: `push_subscriptions.user_agent/last_success_at` + policy ו-GRANT עמודות ל-UPDATE, `profiles.push_enabled` (נכנס ל-GRANT העמודות מהקשחת הפרופיל), `push_log` (RLS פעיל, בלי policies, גישה רק עם service role), ופונקציית `purge_old_push_log()` שה-cron הקיים קורא לה.

## בדיקה מקומית
1. הריצו את המיגרציה. ודאו ב-`.env.local`: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`. אחרי שינוי env צריך להפעיל מחדש את `pnpm dev`.
2. Chrome בדסקטופ על `http://localhost:3000` עובד (localhost נחשב secure context). `/settings` > "הפעילו התראות" > אשרו > "שלחו התראת בדיקה" (פעם בדקה).
3. בדיקה עם שני חשבונות: חשבון A מסמן ⭐ על חוף ומפעיל התראות. חשבון B (דפדפן/פרופיל אחר) מדווח מאותו חוף. A מקבל push. B לא מקבל על הדיווח של עצמו.
4. ידנית: `curl -X POST http://localhost:3000/api/push/send -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" -d '{"beachId":1,"text":"בדיקה"}'` (מחזיר `{recipients,sent,removed,failed}`).
5. מכבים: מתג ב-`/settings`, או חסימה בהגדרות האתר (מנוי שנפל יימחק אוטומטית בשליחה הבאה).

## iOS
דורש iOS/iPadOS 16.4+, האפליקציה **מותקנת** במסך הבית (שיתוף > "הוספה למסך הבית", פתיחה משם), ו-HTTPS. לכן רק אחרי פריסה ל-Vercel (localhost לא רלוונטי לאייפון). בדפדפן Safari רגיל מוצג `InstallHint` במקום בקשת הרשאה.

## Cooldown
לכל היותר push אחד למשתמש לכל חוף ב-30 דקות (`push_log`, `kind = 'report'`). דיווחים נוספים בחלון הזה לא שולחים כלום (הם עדיין בפיד). ההגנה אינה אטומית: שני דיווחים בו-זמנית יכולים לשלוח פעמיים, מקרה נדיר ושולי. `push_log` מנוקה ביומי ע"י ה-cron.

## משתני סביבה ב-Vercel
Project Settings > Environment Variables (Production + Preview), ואז Redeploy (`NEXT_PUBLIC_*` נקבע בזמן build):
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY` (סודי)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (אותו ערך כמו `VAPID_PUBLIC_KEY`)
- `VAPID_SUBJECT` (למשל `https://surfriends.vercel.app`)
- קיימים כבר: `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.

אסור להחליף את מפתחות ה-VAPID אחרי שיש מנויים: מנויים קיימים קשורים למפתח הציבורי ויפסיקו לעבוד.

## התראות על תגובות (Day 13)
בעל דיווח מקבל push כשמישהו לוחץ "🤙 אני בא" / "🚗 בדרך" או כותב תגובה על הדיווח שלו (`sendReplyPush`, נשלח מ-`after()` רק על הוספה בפועל, לא על הסרה ולא על ניסיון חוזר). דילוג: בעל הדיווח הוא המגיב, `push_enabled` כבוי, או שהדיווח נמחק. Cooldown: push אחד לכל (בעלים, דיווח) ב-5 דקות (`push_log`, `kind = 'reply'`, `report_id`); ה-push הראשון אחרי החלון מאגד מגיבים נוספים ("דני ועוד 2 באים"). הקישור פותח `/beach/<id>`.
