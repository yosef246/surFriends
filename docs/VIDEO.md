# סרטוני דיווח

## מגבלות
- דיווח מכיל תמונה **או** סרטון, אף פעם לא שניהם (CHECK `reports_one_media`).
- סרטון עד 10 שניות (`video_duration_ms` בין 1 ל-10500), נדחס במכשיר ל-~480p, עם פוסטר JPEG.
- עד 8MB לקובץ. סוגים מותרים: mp4, webm, quicktime, ופוסטר jpeg.
- בלילה (`is_night_israel`) אי אפשר להעלות, בדיוק כמו דיווח.

## Bucket
`report-videos` (ציבורי). הנתיב: `<user_id>/<uuid>.(mp4|webm|mov)` והפוסטר `<user_id>/<uuid>-poster.jpg` באותו bucket.
מכסת העלאה: 20 אובייקטים למשתמש בשעה (דיווח וידאו = 2 אובייקטים, תואם למגבלת 10 דיווחים בשעה).

## TTL
כמו תמונות: 12 שעות. ה-cron `/api/cron/purge-images` מנקה גם את `report-videos` דרך `expired_report_video_paths`.

## חישוב Egress
~1MB לצפייה. התוכנית החינמית ~5GB בחודש, כלומר כ-4,000-5,000 הפעלות. לכן **רק הפעלה בלחיצה** (tap-to-play), בלי autoplay; בפיד נטען רק הפוסטר.

## אזהרת HEVC .mov
באייפון הקובץ המקורי הוא לרוב HEVC ב-.mov, שלא מתנגן באנדרואיד ובחלק מדפדפני הדסקטופ. לכן הלקוח מעדיף דחיסה ל-mp4 (H.264) או webm; .mov מתקבל רק כגיבוי כשאין תמיכה בדחיסה.

## מיגרציה להרצה
ב-SQL Editor של Supabase: `supabase/migrations/20261103010000_video_reports.sql` (אידמפוטנטית, דורשת קודם את `night_lockout`).

## שדרוג עתידי
אם התנועה גדלה: Supabase Pro (יותר egress), או Cloudflare R2 (egress חינמי) עם החלפת ה-bucket וכתובות ה-URL.
