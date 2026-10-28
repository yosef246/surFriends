# יום 5: פיד, ReportCard, WaveRating, RelativeTime

## נתוני דוגמה לפיד
1. היכנסו לאפליקציה פעם אחת עם Google (כדי שייווצר profile).
2. ב-Supabase: SQL Editor > New query, הדביקו את התוכן של `supabase/dev/sample_reports.sql` והריצו.
3. רעננו את `/`. יופיעו 6 דיווחים (הראשון מלפני 5 דקות) עם כמה תגובות ו"באים".

הדיווחים משויכים ל-profile הראשון שנוצר, וכל טקסט מסתיים ב-` #dev`. אפשר להריץ שוב בבטחה: הסקריפט מוחק את דיווחי ה-dev הקודמים לפני שהוא מכניס מחדש.

## הסרה
```sql
DELETE FROM public.reports WHERE text LIKE '% #dev';
```
התגובות נמחקות אוטומטית (ON DELETE CASCADE).

## הערות
- הקובץ בכוונה לא ב-`migrations/`, ואין להריץ אותו בפרודקשן.
- אין תמונות בנתוני הדוגמה. כדי לבדוק תמונה צריך דיווח עם `image_url` מה-bucket `report-images`.
