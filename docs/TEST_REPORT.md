# דוח QA – יום 7 (surFriends, commit 8cef867)

תאריך: 2026-10-29. היקף: ימים 1–6 + redesign. הבדיקה בוצעה בקריאת קוד מלאה (app/, components/, lib/, middleware, next.config, supabase/), הרצת `lint`/`tsc`/`build`, בדיקות `node --test`, ובדיקות REST קריאה-בלבד מול ה-Supabase המאוחסן עם ה-anon key. לא הורצה בדיקת Lighthouse ולא נבדק דפדפן אמיתי (ראו צ'קליסט ידני).

## סיכום תיקונים (יום 7, אחרי QA)

- high: 1/1 תוקן (BUG-001). medium: 5/5 תוקנו (BUG-002 עד BUG-006).
- low: 8/12 תוקנו (008, 009, 011, 012, 013, 015, 016, 018). נדחו ליום 13: BUG-007, BUG-010, BUG-014, BUG-017.
- בדיקות: `pnpm lint` ו-`tsc --noEmit` עברו, `NEXT_DIST_DIR=.next-verify pnpm build` עבר, `node --test tests/*.test.ts`: 38 עברו, 0 נכשלו, 0 todo.

## להריץ ב-SQL Editor

להריץ ידנית בפרויקט המאוחסן (פעם אחת, בטוח להרצה חוזרת): `supabase/migrations/20261029010000_day7_hardening.sql`

יום 13 (חובה לפני חשיפת התראות, BUG-019): `supabase/migrations/20261029060000_push_insert_lockdown.sql` (מוחק את מדיניות ה-INSERT וה-UPDATE על `push_subscriptions` ושולל INSERT/UPDATE מ-anon/authenticated; הכתיבה ממילא דרך admin client אחרי `isAllowedPushEndpoint`).

- ה-CHECK-ים נוצרים `NOT VALID` ואז מתבצע ניסיון `VALIDATE`; אם שורה ישנה מפרה, מודפס NOTICE והמיגרציה לא נכשלת.
- שורות הדמו עם גובה גל `'מעל הראש'` מתוקנות ל-`'ראש'` (גם ב-`supabase/dev/sample_reports.sql`).
- הטריגרים לא חלים על הרצות מה-SQL Editor (`auth.uid()` ריק), ולכן סקריפט הדמו ממשיך לעבוד.
- אחרי ההרצה ה-bucket מקבל רק `image/jpeg`.

## סיכום

**Verdict: מוכן לדמו פנימי אחרי תיקון BUG-001. אין חסימות קריטיות.** האבטחה של שכבת האפליקציה טובה (אין open redirect, אין XSS, אין service role בצד לקוח, ownership נבדק). החור המשמעותי היחיד נמצא בשכבת ה-DB: ה-RLS לא מגביל עמודות, ולכן כל ולידציית `createReport` ניתנת לעקיפה.

| חומרה | כמות | מזהים |
|---|---|---|
| critical | 0 | |
| high | 1 | BUG-001 |
| medium | 5 | BUG-002 עד BUG-006 |
| low | 12 | BUG-007 עד BUG-018 |

| בדיקה | תוצאה |
|---|---|
| `pnpm lint` | עבר, 0 אזהרות |
| `pnpm exec tsc --noEmit` | עבר |
| `NEXT_DIST_DIR=.next-verify pnpm build` | עבר. `/` 132kB, `/new` 195kB, `/login` 189kB (First Load), middleware 94.6kB |
| `node --test tests/*.test.ts` | 33 בדיקות: 32 עברו, 0 נכשלו, 1 `todo` (נעוץ ל-BUG-002, נכשל בכוונה) |

## מה נבדק ונמצא תקין (ללא ממצא)

- **Open redirect:** `safeNextPath` חוסם `//`, `\`, תווי בקרה, סכמות, ו-`/login`,`/callback`. ב-callback ה-`origin` נצמד לפני ה-path, כך שגם `%2F` לא בורח. `sf_next` עובר דרך אותו מסנן. מכוסה ב-`tests/safe-next.test.ts`.
- **Middleware:** ה-matcher מכסה את כל המסלולים מלבד סטטיים; `PUBLIC_PATHS` מינימלי. `getUser()` (לא `getSession`) משמש לאימות.
- **Service role:** לא מופיע בשום קובץ מעקב (`git grep`). `.env.local` מוחרג ב-`.gitignore` ולא בהיסטוריה.
- **XSS:** אין `dangerouslySetInnerHTML`/`innerHTML`/`eval`. טקסט משתמש מרונדר כ-text node (`whitespace-pre-line`).
- **CSRF:** כל ה-actions הם Server Actions של Next 15 (בדיקת Origin מובנית, ללא `allowedOrigins`), עוגיות Supabase `SameSite=Lax`. `signOut` הוא action ולא GET.
- **deleteReport:** בדיקת ownership כפולה (`.eq("user_id")` + RLS), וולידציית מזהה. אין כרגע UI שקורא לו.
- **createReport (שכבת action):** user מה-session בלבד, rating 1–5 שלם, `waveHeight` מרשימה סגורה, אורך בנקודות קוד, `imagePathFromUrl` (origin + תיקיית המשתמש + `uuid.jpg`, בלי query/hash), קיום חוף.
- **REST מול ה-DB החי (anon):** `push_subscriptions` ו-`user_favorites` מחזירים `[]`; insert אנונימי ל-`reports`/`replies` נדחה (401/42501); העלאה אנונימית ל-Storage נדחתה (403). שאילתת ה-embed של הפיד (`replies(count)` + `coming:replies(count)` עם `coming.quick_reaction=eq.coming`) וה-embed של החופים (`user_favorites` + `reports(count)` מסוננים) מחזירות מבנה תקין.
- **Reduced motion:** בלוק `@media (prefers-reduced-motion)` ב-`globals.css` כולל `*{animation-duration:.01ms; iteration-count:1}`, ולכן מכסה גם `animate-spin`/`animate-toast-in` (Tailwind inline) ולא רק את ה-`motion-*`.
- **RTL:** grep ל-`left-/right-/ml-/mr-/pl-/pr-/text-left/text-right` ב-`app/` ו-`components/` לא מצא כלום (שימוש עקבי ב-`start/end/ms/me`). מקשי החצים ב-`BeachPicker`/`WaveRatingInput` הפוכים נכון ל-RTL.
- **RelativeTime hydration:** `getServerSnapshot=null` מבטיח טקסט מוחלט בשרת ובהידרציה, בלי mismatch. אזור זמן `Asia/Jerusalem` מכוסה בבדיקות (כולל חצות מקומית). `greetingFor` מחושב בשרת ב-`Asia/Jerusalem`.
- **HEIC:** נתיב הכשל קיים ומציג "נסו JPG או PNG". EXIF: `createImageBitmap(..., {imageOrientation:"from-image"})` עם fallback ל-`<img>`.

## ממצאים

### BUG-001 | high | מדיניות INSERT על `reports` לא מגבילה עמודות; ולידציית השרת ניתנת לעקיפה
- **סטטוס:** ✅ fixed (fix: day 7 commit). טריגר BEFORE INSERT שכופה `created_at=now()`, CHECK על `wave_height_estimate` ועל `image_url` (תיקיית המשתמש בלבד), ו-`ReportCard` בודק host לפני `<Image>`. מיגרציה `20261029010000_day7_hardening.sql`. אין UPDATE policy, ולכן אי אפשר לשנות `created_at` אחרי יצירה.
- **קובץ:** `supabase/migrations/20261028000000_init_schema.sql` (policy "Authenticated can create own reports", וה-CHECKs על `reports`); עקיפה של `app/actions/reports.ts:14-81`.
- **תרחיש:** כל משתמש מחובר (התחברות Google חופשית) יכול לקרוא ל-`POST /rest/v1/reports` עם ה-anon key וה-JWT שלו ולשלוח: `created_at: "2999-01-01"` (הדיווח נתקע ראשון בפיד לנצח, נספר ב-`recentCount`, ושובר את ה-cursor), `image_url` מכל כתובת (ב-dev `next/image` זורק "hostname not configured" ומפיל את `/` לכולם; ב-production תמונה שבורה, או הפניה לאובייקט של משתמש אחר בנתיב `/storage/v1/object/public/**`), `wave_height_estimate` מחרוזת באורך שרירותי שתרונדר בכל כרטיס, `id` מותאם. אותו דבר ב-`replies` (`created_at`). (לא הורץ מול הפרודקשן כדי לא ליצור נתוני זבל; הניתוח לפי ה-policy והסכמה.)
- **תיקון:** להוסיף מיגרציה: `CHECK (wave_height_estimate IS NULL OR wave_height_estimate IN ('קרסול','ברך','מותן','כתף','ראש'))`, `CHECK (image_url IS NULL OR image_url ~ '^https://<project>\.supabase\.co/storage/v1/object/public/report-images/[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$')` (ועוד התאמה ל-`user_id` ב-trigger), ו-`BEFORE INSERT` trigger שמאלץ `created_at = now()`; או `REVOKE INSERT ON reports FROM authenticated; GRANT INSERT (user_id, beach_id, text, image_url, wave_rating, wave_height_estimate) ...`. בנוסף, כדאי ש-`ReportCard` לא יסתמך על ה-DB: לעטוף את `<Image>` בבדיקת host.

### BUG-002 | medium | Cursor pagination מדלגת על דיווחים עם `created_at` זהה (ה-ties bug) ואין סדר משני
- **סטטוס:** ✅ fixed (fix: day 7 commit). keyset על `(created_at, id)` עם `.or()`, cursor מאומת בקפדנות; הבדיקה הפכה לאמיתית ועוברת.
- **קובץ:** `lib/feed.ts:47-50`, `app/(app)/feed-actions.ts:8`, `components/feed/ReportList.tsx:21-24`.
- **תרחיש:** `.order("created_at").limit(20)` ואז `.lt("created_at", last.created_at)`. כל שורה שחולקת `created_at` עם השורה האחרונה בעמוד נעלמת; בנוסף, בלי `order id` הסדר בין שורות שוות לא דטרמיניסטי. מופיע בפועל בנתוני `supabase/dev/sample_reports.sql` (INSERT אחד, `now()` זהה), וכל עמוד 21+ בנתוני דמו. קורה גם עם דיווחים שנוצרים בו-זמנית (Date.parse לא מתעסק במיקרו-שניות, אך המחרוזת עוברת כמות שהיא ולכן שמורה).
- **תיקון:** keyset על `(created_at, id)`: `.order("created_at",{ascending:false}).order("id",{ascending:false})` ו-`.or(\`created_at.lt.${c},and(created_at.eq.${c},id.lt.${id})\`)`; ה-cursor הופך ל-`{created_at,id}` (לאמת את שניהם בשרת: ISO strict + UUID, כדי שלא להזריז פרמטר לתוך מחרוזת ה-`or`). הבדיקה `cursor pagination has an id tiebreak` ב-`tests/feed-query.test.ts` תתחיל לעבור.

### BUG-003 | medium | אובדן תגובת השרת גורם לדיווח כפול ולמחיקת תמונה שכבר מקושרת
- **סטטוס:** ✅ fixed (fix: day 7 commit). `id` נוצר בלקוח (`crypto.randomUUID()`) ומועבר ל-`createReport`; כפילות PK נחשבת הצלחה (רק אם הדיווח של אותו משתמש); התמונה נמחקת רק אחרי דחיית ולידציה (`rejected`), לא אחרי exception, והיא נשמרת לשימוש חוזר בניסיון חוזר.
- **קובץ:** `components/forms/NewReportForm.tsx:115-127`.
- **תרחיש:** `createReport` מצליח ב-DB, אך התגובה לא מגיעה (רשת נופלת/timeout) → ה-`catch` יוצר `error`, ואז הקוד מוחק את `uploadedPath` מה-Storage. הדיווח הקיים נשאר עם תמונה שבורה, והמשתמש לוחץ שוב ומקבל דיווח כפול. אין idempotency.
- **תיקון:** לא למחוק את התמונה כשהשגיאה היא exception (תוצאה לא ידועה), ולהעביר `clientId` (UUID שנוצר לפני השליחה) כ-`id` של הדיווח כדי שניסיון חוזר ייכשל על PK במקום ליצור כפילות.

### BUG-004 | medium | שליחה בזמן עיבוד תמונה שולחת דיווח בלי התמונה, בשקט
- **סטטוס:** ✅ fixed (fix: day 7 commit). `PhotoField.onProcessing`; הכפתור מושבת עם התווית "מעבדים תמונה..." ו-`onSubmit` חוסם בזמן עיבוד.
- **קובץ:** `components/forms/PhotoField.tsx:41-46` (`onChange(null)` בתחילת העיבוד) + `NewReportForm.tsx:69,78` (`busy` לא כולל עיבוד תמונה).
- **תרחיש:** בוחרים תמונה גדולה (1-3 שניות במכשיר חלש), לוחצים "פרסמו" מיד → `photo===null`, הדיווח עולה בלי תמונה ובלי אזהרה.
- **תיקון:** להעלות `processing` ל-`NewReportForm` (callback `onProcessing`) ולכלול ב-`busy`/`disabled` של כפתור השליחה.

### BUG-005 | medium | אין rate limiting / מכסה על דיווחים והעלאות
- **סטטוס:** ✅ fixed (fix: day 7 commit). טריגרים: 10 דיווחים/שעה, 30 תגובות/שעה (הודעה בעברית ב-`createReport`); מדיניות העלאה ל-Storage מוגבלת ל-20/שעה; ה-bucket מקבל רק `image/jpeg`.
- **קובץ:** `app/actions/reports.ts` (אין throttle), bucket `report-images` (מדיניות INSERT ללא מגבלת כמות).
- **תרחיש:** משתמש מחובר יכול לפרסם אלפי דיווחים או להעלות אובייקטים של עד 5MB בלולאה ל-`/storage/v1/object/report-images/{uid}/...` בלי ליצור דיווח (עלות Storage, ספאם בפיד). ה-MIME נקבע על ידי הלקוח; ה-bucket מאשר גם gif/heic.
- **תיקון:** טריגר/בדיקה ב-DB (למשל `reports` ≤ 10 לשעה למשתמש) ומגבלה מקבילה על העלאות (טריגר על `storage.objects` או ניקוי תקופתי); לצמצם `allowed_mime_types` ל-`image/jpeg` בלבד, כי הלקוח ממיר תמיד ל-JPEG.

### BUG-006 | medium | שלוש קריאות `auth.getUser()` + שאילתת פרופיל כפולה בכל טעינת עמוד
- **סטטוס:** ✅ fixed (fix: day 7 commit). `lib/auth.ts` עם `React.cache` (`getCurrentUser`/`getCurrentProfile`/`getSupabase`) בשימוש ב-layout, page ו-actions. ה-middleware לא שונה (עדיין קריאת auth אחת + אחת משותפת לרינדור).
- **קובץ:** `middleware.ts:30`, `app/(app)/layout.tsx:11`, `app/(app)/page.tsx:12-24` (וגם `profiles` נשלף ב-layout וב-page).
- **תרחיש:** כל ניווט = 3 round-trips ל-Supabase Auth לפני רינדור, ועוד שאילתת `profiles` כפולה. פוגע ב-TTFB/LCP ביעד ה-Lighthouse 90+.
- **תיקון:** לעטוף ב-`React.cache` פונקציות `getUser()`/`getProfile()` משותפות ל-layout ול-page (ולהשתמש ב-`supabase.auth.getClaims()` ב-layout/page, כשה-middleware כבר אימת).

### BUG-007 | low | שגיאת שאילתה ב-Hero/חופים נבלעת ומוצגת כ"הים שקט"
- **סטטוס:** ⏸ deferred to Day 13.
- **קובץ:** `lib/feed.ts:81-98` (`fetchHeroSummary` לא בודק `error`), `lib/feed.ts:122` (`return []`).
- **תרחיש:** ה-DB לא זמין / RLS שגוי → `recentCount=0` ומוצג מצב ריק מטעה עם כפתור "לדיווח חדש", בעוד הפיד עצמו נופל ל-`error.tsx`.
- **תיקון:** לזרוק (או להחזיר דגל `failed`) ולהציג מצב שגיאה מקומי.

### BUG-008 | low | `created_at` null הופך ל-1970; ו-`Date.parse` של ה-cursor מתירני
- **סטטוס:** ✅ fixed (fix: day 7 commit). `created_at NOT NULL` במיגרציה ובטיפוסים; הנפילה ל-1970 הוסרה; cursor מאומת ב-ISO קפדני.
- **קובץ:** `lib/feed.ts:62`, `app/(app)/feed-actions.ts:8`.
- **תרחיש:** העמודה nullable; שורה בלי `created_at` נשלחת כ-cursor `1970-01-01` ומסיימת את הדפדוף. `Date.parse("1")` תקין ב-V8, לכן ערך לא-ISO עובר את בדיקת השרת וייכשל רק ב-PostgREST (מוחזר `ok:false`, לא קריסה).
- **תיקון:** `NOT NULL` על `created_at` (+ עדכון הטיפוסים), ולאמת cursor בביטוי ISO קפדני.

### BUG-009 | low | אין בדיקת גודל/מימדים לפני פענוח תמונה
- **סטטוס:** ✅ fixed (fix: day 7 commit). דחיית קובץ מעל 25MB לפני פענוח, ונוסח ההודעה תוקן. לא הוספתי `resizeWidth` ל-`createImageBitmap` (דורש ידיעת מימדים מראש).
- **קובץ:** `lib/image-process.ts:33-48`.
- **תרחיש:** קובץ של עשרות MB או פנורמה 12000×12000 נטענים לזיכרון במלואם לפני ההקטנה; במכשיר חלש הלשונית עלולה לקרוס. ההודעה `IMAGE_TOO_BIG_ERROR` ("עד 5MB") מטעה, כי הפלט אחרי הקטנה ל-1600px כמעט אף פעם לא עובר 5MB.
- **תיקון:** לדחות `file.size` מעל ~25MB מראש, ולהעביר `resizeWidth/resizeHeight` ל-`createImageBitmap`; לתקן את נוסח ההודעה.

### BUG-010 | low | העלאות יתומות כשהלשונית נסגרת בין העלאה לפרסום
- **סטטוס:** ⏸ deferred to Day 13.
- **קובץ:** `components/forms/NewReportForm.tsx:103-123`.
- **תרחיש:** נתיב ההתאוששות (הסרה ב-`createReport` error) לא מופעל אם המשתמש סוגר/הרשת נופלת אחרי ההעלאה ולפני הפרסום. אין job ניקוי.
- **תיקון:** job מתוזמן (או `pg_cron`) שמוחק אובייקטים ב-`report-images` ללא `reports.image_url` מתאים וישנים מ-24 שעות.

### BUG-011 | low | אין security headers
- **סטטוס:** ✅ fixed (fix: day 7 commit). `headers()` ב-`next.config.ts`: nosniff, Referrer-Policy, X-Frame-Options DENY, `frame-ancestors 'none'`, Permissions-Policy. ללא CSP של סקריפטים בכוונה.
- **קובץ:** `next.config.ts` (אין `headers()`).
- **תרחיש:** אין `X-Frame-Options`/`frame-ancestors` (clickjacking על "פרסמו"), `X-Content-Type-Options`, `Referrer-Policy`, CSP.
- **תיקון:** להוסיף `headers()` עם `frame-ancestors 'none'`, `nosniff`, `strict-origin-when-cross-origin`, ו-CSP בסיסי שמאשר את host ה-Supabase ו-Google avatars.

### BUG-012 | low | עוגיית `sf_next` ללא `Secure`
- **סטטוס:** ✅ fixed (fix: day 7 commit). נוסף `; secure` כשהפרוטוקול https.
- **קובץ:** `app/(auth)/login/login-button.tsx:48`.
- **תרחיש:** נשלחת גם ב-HTTP. הערך עובר `safeNextPath`, ולכן ההשפעה זניחה.
- **תיקון:** להוסיף `; secure` כש-`location.protocol==="https:"`.

### BUG-013 | low | a11y: שמות נגישים שגויים או נבלעים
- **סטטוס:** ✅ fixed (fix: day 7 commit). Hero: הוסרו `aria-label`/`aria-hidden` כך שהמספר מוקרא; `<time>` בלי `aria-label`; כפתורי הדירוג עם `aria-label` "N מתוך 5, תווית".
- **קבצים:** `components/feed/HeroSummary.tsx:23` (`aria-label` על `<p>` ללא role, לא מוקרא בקוראי מסך; הספרה עצמה `aria-hidden`, כלומר המספר לא נשמע כלל), `components/shared/RelativeTime.tsx:84` (`aria-label` על `<time>` דורס את הטקסט היחסי, ולכן "לפני 5 דקות" לא מוקרא), `components/forms/WaveRatingInput.tsx:48-57` (השם הנגיש של כל כפתור הוא רק "קטן"/"טוב", בלי המספר, כי הספרה `aria-hidden`).
- **תיקון:** `role="img"` או טקסט `sr-only` ב-Hero; להסיר את `aria-label` מ-`<time>` ולהשאיר `title`; להוסיף `aria-label={\`${n} מתוך 5, ${LABELS[n-1]}\`}` לכפתורי הדירוג.

### BUG-014 | low | a11y: טיפול בשגיאות
- **סטטוס:** ⏸ deferred to Day 13.
- **קבצים:** `components/forms/NewReportForm.tsx:77-86` (UX_SPEC: אחרי submit כושל הפוקוס צריך לעבור לשדה השגוי הראשון; לא ממומש), `components/feed/ReportList.tsx:46,51` (כשהפיד ריק אין `<h1>`; ה-`sr-only h1` נמצא רק בענף הלא-ריק), `components/layout/OfflineBanner.tsx:25` (אזור `role=status` שנוצר יחד עם התוכן בדרך כלל לא מוכרז; צריך container קבוע).
- **תיקון:** `ref.focus()` לשדה הראשון עם שגיאה; להעביר את ה-`h1` ל-`page.tsx`; להשאיר container `aria-live` קבוע ולהחליף רק את הטקסט.

### BUG-015 | low | תוויות דירוג לא עקביות בין הקלט לתצוגה
- **סטטוס:** ✅ fixed (fix: day 7 commit). מקור יחיד `WAVE_RATING_LABELS` ב-`lib/reports.ts`; חלון "חי" יושר לשעתיים כמו ה-Hero (החלטה: שעתיים, כי הטקסט ב-Hero אומר שעתיים).
- **קבצים:** `components/forms/WaveRatingInput.tsx:5` ("שטוח, קטן, סביר, טוב, אש") מול `components/feed/WaveRating.tsx:1` ("שטוח, חלש, סביר, טוב, מעולה").
- **תרחיש:** בוחרים "קטן" ורואים בפיד "חלש". בנוסף חלון ה-Hero הוא שעתיים וה-"חי" בעיגולים 3 שעות (`lib/feed.ts:75,125`); צריך החלטת מוצר.
- **תיקון:** מקור אחד ל-`LABELS` ב-`lib/reports.ts`; ליישר חלונות זמן.

### BUG-016 | low | `lib/database.types.ts` לא מסונכרן עם המיגרציות (Insert)
- **סטטוס:** ✅ fixed (fix: day 7 commit). `lib/database.types.ts` מסונכרן ידנית עם כל המיגרציות כולל החדשה (`text?`, `created_at` NOT NULL). ה-casts `as unknown as` נשארו (embeds).
- **קובץ:** `lib/database.types.ts:131` ו-`:179` (`reports.Insert.text` ו-`replies.Insert.text` מסומנים חובה `text: string | null` אף שהעמודה nullable בלי default), ושאילתות ב-`lib/feed.ts` עטופות ב-`as unknown as Row[]`.
- **תרחיש:** יום 9 (replies עם quick reaction בלי טקסט) יחייב להעביר `text: null` במפורש; הטיפוסים לא מגנים על שדות embed.
- **תיקון:** ליצור מחדש עם `supabase gen types typescript` (יהפוך ל-`text?:`), ולהחליף את ה-casts בטיפוסי embed.

### BUG-017 | low | ביצועים: גופנים וגודל bundle
- **סטטוס:** ⏸ deferred to Day 13.
- **קבצים:** `app/layout.tsx:5-20`, `app/(auth)/login/login-button.tsx`.
- **תרחיש:** שלוש משפחות גופנים נטענות ב-`<body>` בכל עמוד; `JetBrains Mono` משמש רק למונה תווים אחד (`NewReportForm.tsx:195`), ו-Plex Hebrew נטען ב-4 משקלים. `/login` ב-189kB First Load בגלל `@supabase/supabase-js` בצד לקוח. תמונת הכרטיס הראשון בפיד בלי `priority` (LCP).
- **תיקון:** להסיר את JetBrains Mono (או `ui-monospace`), לצמצם ל-400/500/600, `priority` ל-`index===0` עם תמונה, ו-`dynamic import` ל-client של Supabase בלחיצה בלבד.

### BUG-018 | low | חוקי "טקסט או דירוג" לא זהים בין הלקוח, השרת וה-DB
- **סטטוס:** ✅ fixed (fix: day 7 commit). `validateReportInput` משותף (לקוח + שרת) ב-`lib/reports.ts` עם בדיקות; טקסט של תווי רווח/Cf בלבד נחשב ריק; 3+ שורות ריקות מצטמצמות; ב-DB `btrim(text, E' \t\r\n')`.
- **קבצים:** `app/actions/reports.ts:26,41` (`trim()` של JS מסיר את כל סוגי הרווח), מיגרציה `20261029000000_...sql` (`btrim()` מסיר רק רווחים רגילים), `ReportCard.tsx:62`.
- **תרחיש:** דרך ה-REST ישירות, טקסט `"\n"` בלי דירוג עובר את ה-CHECK; גם בדרך הרגילה טקסט של תווי zero-width (`​`) בלבד עובר את כל השכבות ונראה ריק; 500 תווי `\n` יוצרים כרטיס גבוה (`whitespace-pre-line`).
- **תיקון:** ב-DB `btrim(text, E' \t\r\n')` ובשרת סינון `\p{Cf}`; להגביל שורות רצופות (`/\n{3,}/`).

## הערות אבטחה נוספות (לא באג)

- **נתונים נקראים לאנונימי:** ה-RLS מאפשר ל-anon לקרוא `reports`, `profiles` (שם, avatar), `replies`, `beaches` (אימתתי: 8 דיווחים מוחזרים ללא התחברות). ה-middleware חוסם רק את ה-UI. אם זו לא כוונה, יש לשנות ל-`TO authenticated`.
- **Storage ציבורי:** ה-bucket ציבורי עם SELECT policy; המזהים כבר חשופים דרך `reports.user_id`.
- **לא אומת מול נתונים חיים:** ספירת `comingCount` (אין עדיין תגובות בטבלה, ולא יצרתי נתונים). ראו צ'קליסט.

## לא נבנה עדיין (Day 8+)

לא נספרים כבאגים. כל הקישורים הבאים מובילים כעת למסך `ComingSoon` וראוי לדעת זאת בדמו:

- F2 auto-refresh: Realtime + `NewReportsPill` + optimistic updates (יום 8).
- F4 תגובות ו-quick reactions: UI (יום 9). ה-DB והספירות כבר קיימים.
- F5 סינון פיד לפי חוף/עיר ודף `/beach/[id]` (כל עיגול חוף וכל שם חוף בכרטיס מובילים לשם).
- F6 תחזית גלים, `/api/forecast/[beachId]` (ימים 10–11; הנתיב כבר ב-`PUBLIC_PATHS` אך אינו קיים).
- F7 Web Push ו-subscribe action (יום 12).
- F8 `/profile`, `/profile/[id]`, `/settings` (רק התנתקות קיימת), עריכת פרופיל, ניהול מועדפים (ללא UI למועדפים, `BeachCircleRow` מציג את כל החופים), UI למחיקת דיווח (ה-action `deleteReport` קיים).
- `updateProfile`, `toggleFavoriteBeach`, `subscribeToPush`, `replyToReport` מה-spec §7.
- Lighthouse CI ובדיקות נגישות אוטומטיות (יום 13); README/Deploy (יום 14).

## תוצאות בדיקות

הרצה: `node --test tests/*.test.ts` (Node v24.11.1, ללא תלויות חדשות).

| קובץ | מה נבדק | תוצאה |
|---|---|---|
| `tests/in-app-browser.test.ts` | `isInAppBrowser` (קיים) | 12/12 עברו |
| `tests/safe-next.test.ts` | open redirect: נתיבים תקינים, `//`, `\`, תווי בקרה, סכמות, לולאת auth | 6/6 עברו |
| `tests/reports-validation.test.ts` | `textLength` (נקודות קוד, אימוג'י), `imagePathFromUrl` (origin דומה, `@`, traversal, query/hash, bucket זר, תיקיית משתמש אחר, זבל), רשימת `WAVE_HEIGHTS` | 7/7 עברו |
| `tests/relative-time.test.ts` | `formatRelative`/`formatAbsolute` ב-`Asia/Jerusalem`, חצות מקומית, "אתמול" | 4/4 עברו |
| `tests/feed-query.test.ts` | `fetchReports` מול builder מדומה: סדר, limit, embeds, מיפוי null | 3 עברו + 1 `todo` שנכשל בכוונה (BUG-002: tiebreak) |

סה"כ 33 בדיקות, 32 עברו, 0 נכשלו, 1 `todo`. הערה: `createReport` עצמו אינו טהור (מערבב Supabase ו-`process.env`), ולכן לא נבדק מקצה לקצה. מומלץ לחלץ `validateReportInput(raw, userId, supabaseUrl)` ל-`lib/reports.ts` ולכסות בבדיקות (rating, הגבלת אורך 500 נקודות קוד, "טקסט או דירוג").

**עדיין חסר כיסוי:** `createReport`/`deleteReport` (דורש client מדומה), אינטגרציית RLS אמיתית עם משתמש בדיקה, `processImage` (דורש דפדפן/canvas), רכיבי UI, `fetchBeachCircles`/`fetchHeroSummary`.

## צ'קליסט בדיקה ידנית

### טלפון (iPhone Safari + Android Chrome)
- [ ] התחברות עם Google; חזרה ל-`/` ללא לולאה; כניסה ל-`/new` כשמנותקים מחזירה ל-`/new` אחרי ההתחברות.
- [ ] פתיחת הקישור מתוך WhatsApp/Instagram: מוצג הפתק "פתחו ב-Chrome או Safari", כפתור "העתק קישור" עובד.
- [ ] דיווח מלא: חוף + דירוג בלבד (בלי טקסט) מתפרסם; טקסט בלבד מתפרסם; בלי שניהם מציג שגיאה.
- [ ] צילום תמונה מהמצלמה (תמונה אנכית, מופיעה באותו כיוון בפיד); תמונת HEIC/גדולה מהגלריה; שליחה מיד אחרי בחירת תמונה (BUG-004).
- [ ] מצב טיסה באמצע שליחה: הודעת שגיאה והטקסט נשמר; לחיצה כפולה מהירה על "פרסמו" לא יוצרת שני דיווחים.
- [ ] 21+ דיווחים: "טען עוד" מביא את העמוד הבא ללא כפילויות/דילוגים (BUG-002).
- [ ] BottomNav מעל ה-home indicator (safe-area), כפתור "דיווח" מורם ואינו נחתך; מקלדת פתוחה ב-`/new` לא מסתירה את כפתור השליחה.
- [ ] הגדלת טקסט מערכת ל-130%: אין חיתוך בכרטיסים ובצ'יפים; אין גלילה אופקית של העמוד כולו.
- [ ] הפעלת "Reduce Motion": האנימציות נעצרות; הספינרים לא נתקעים בצורה מטעה.
- [ ] VoiceOver/TalkBack: גלילת הפיד, בחירת חוף ודירוג ב-`/new`, הקראת Hero ושעת הדיווח (BUG-013).

### מחשב (Chrome + Firefox)
- [ ] ניווט מקלדת מלא ב-`/new`: Tab, חצים ב-radiogroup של חוף ושל דירוג (כיוון RTL), טבעת focus נראית על כל פקד.
- [ ] hover על כרטיס: scale 1.02 בלי גלילה אופקית ובלי חיתוך צל.
- [ ] Lighthouse (Mobile, ב-`next start` על build): Performance/A11y/Best Practices/SEO, יעד 90+. לבדוק LCP בפיד ו-TBT ב-`/login`.
- [ ] DevTools Network: מספר הקריאות ל-`/auth/v1/user` בטעינת עמוד (צפוי 3, ראו BUG-006).
- [ ] הוספת תגובה `coming` ב-SQL Editor לדיווח קיים: הכרטיס מציג "תגובה אחת · בא אחד" והספירה נכונה.
- [ ] הרצת `supabase/dev/sample_reports.sql` ובדיקת דפדוף על פני גבול עמוד (BUG-002).
- [ ] התנתקות ב-`/settings`: חזרה ל-`/login`, ו-Back אינו חושף את הפיד.
- [ ] `/login?next=https://evil.com` ו-`/login?next=//evil.com` מתחברים ונוחתים ב-`/`.


---

## Day 13 — QA מלא (סקירת קוד)

תאריך: 2026-10-29, commit בסיס ef7152b. היקף: סקירת קוד סטטית (app, components, lib, middleware, next.config, public/sw.js, כל המיגרציות). לא הורצו שרת, build, lint או Lighthouse. הורצו רק `node --test tests/*.test.ts` ו-`pnpm exec tsc --noEmit`.

### Lighthouse (ראש הצוות, `/login`, production build על :3100, lighthouse@12)

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| מובייל | 95 | 100 | 100 | 82 |
| דסקטופ | 100 | 100 | 100 | 82 |

- **BUG-029 | high | ✅ fixed (2617fae):** `motion-page` (‏`page-enter`) התחיל את כל `<main>` ב-`opacity: 0`, ולכן Lighthouse החזיר `NO_LCP` וציון Performance מובייל של 0. עכשיו האנימציה היא `transform` בלבד. מובייל: FCP 1.1s, LCP 2.6s, TBT 130ms, CLS 0.
- **BUG-030 | low | ✅ fixed (fix: day 13):** נוספו `app/robots.ts` (מתיר `/login`, חוסם נתיבי האפליקציה ו-`/api/`), החרגת `robots.txt` ו-`sitemap.xml` מה-matcher, ו-`metadata` עם description בעברית בדף `/login`. SEO 82. חסר `meta description` בדף `/login`, ו-`/robots.txt` מופנה ל-`/login` ע"י ה-middleware (‏307). צריך `app/robots.ts` ולהחריג את `robots.txt` ב-matcher.
- הזדמנויות: unused JavaScript (~71KiB), legacy JavaScript (~11KiB).
- דפים מחוברים לא נבדקו ב-Lighthouse (אין session). ניתוח סטטי: First Load JS של 189–218KB לדף.
- סריקת chunks בצד הלקוח: לא נמצאו `service_role`, `VAPID_PRIVATE` או `CRON_SECRET`.

### סיכום

| חומרה | כמות | מזהים |
|---|---|---|
| critical | 0 | |
| high | 1 | BUG-019 |
| medium | 2 | BUG-020, BUG-021 |
| low | 7 | BUG-022 עד BUG-028 |

בדיקות: `node --test tests/*.test.ts`: 102 בדיקות, 101 עברו, 0 נכשלו, 1 `todo` (BUG-019, נכשל בכוונה עד שהמיגרציה תיכתב). `tsc --noEmit`: נקי. נוסף `tests/security-static.test.ts` (סריקה סטטית: service role רק ב-admin.ts, כל server action בודק session, נתיבי CRON_SECRET עם `timingSafeEqual` ו-fail closed, SW same-origin).

### טבלת Guards (כל ה-server actions וה-route handlers)

| שם | Guard |
|---|---|
| `signOut` (app/(app)/actions.ts) | אין בדיקה (מכוון: מנקה session). Server Action, Origin check של Next |
| `loadMoreReports` | `getCurrentUser()`; cursor/beachId/authorId מאומתים |
| `createReport` | `getCurrentUser()` + `validateReportInput` + RLS + טריגר rate limit |
| `deleteReport` | `getCurrentUser()` + `.eq(user_id)` + RLS |
| `replyToReport`, `toggleReaction`, `deleteReply` | `getCurrentUser()` (אחרי ולידציה) + RLS + `.eq(user_id)` |
| `updateProfile` | `getCurrentUser()`, עמודות מוגבלות (GRANT עמודות) |
| `toggleFavoriteBeach` | `getCurrentUser()` + RLS |
| `subscribeToPush` | `getCurrentUser()` + `validateSubscription` (allowlist) + admin upsert עם user.id מה-session |
| `unsubscribeFromPush` | `getCurrentUser()` + `.eq(user_id)` + RLS |
| `setPushEnabled`, `sendTestPushAction` | `getCurrentUser()`; בדיקת push מוגבלת לפעם בדקה (push_log) |
| `GET /api/cron/purge-images` | `CRON_SECRET` Bearer, sha256 + `timingSafeEqual`, 500 אם הסוד חסר (fail closed) |
| `POST /api/push/send` | כנ"ל + ולידציית גוף |
| `POST /api/push/resubscribe` | session cookie (middleware + `getCurrentUser()`), `validateSubscription` |
| `GET /api/forecast/[beachId]` | ציבורי במכוון, `parseBeachId` + קיום חוף + cache |
| `GET /callback` | ציבורי במכוון, `safeNextPath` + origin קבוע |
| `GET /pwa-icon/[size]` | ציבורי במכוון, allowlist של גדלים |
| `app/manifest.ts`, `icon`, `apple-icon` | סטטיים וציבוריים |

### מה נבדק ונמצא תקין

- Service role: רק `createAdminClient()` ב-`lib/supabase/admin.ts` (`server-only`), בשימוש ב-`lib/push-send.ts` (server-only) וב-route ה-cron. אין שימוש בצד לקוח. `.env.local` לא במעקב git.
- SW `notificationclick`: `safeUrl` ממיר ל-URL מול `self.location.origin` ומחזיר `/` אם ה-origin שונה (`//evil.com`, `javascript:` נחסמים). אין open redirect.
- `push_log`: RLS פעיל, אפס policies, `REVOKE ALL` מ-anon/authenticated. תקין.
- `push_subscriptions` UPDATE: policy עם `USING` ו-`WITH CHECK`, ובנוסף GRANT עמודות (`p256dh, auth, user_agent` בלבד), כך שאי אפשר להעביר בעלות או לשנות endpoint.
- פונקציות SECURITY DEFINER (`handle_new_user`, `purge_expired_reports`, `expired_report_image_paths`, `purge_old_push_log`): כולן `SET search_path = ''` ו-`REVOKE` מ-PUBLIC/anon/authenticated (הערות ב-BUG-026).
- Allowlist של endpoint (`isAllowedPushEndpoint`): https בלבד, בלי user/password/port, host = סיומת של FCM/Mozilla/Apple/Windows. תקין ברמת האפליקציה, אך נעקף ב-DB (BUG-019).
- Headers: nosniff, Referrer-Policy, X-Frame-Options DENY, `frame-ancestors 'none'`, Permissions-Policy; `/sw.js` ללא cache. אין CSP לסקריפטים (החלטה מתועדת).
- אין XSS (`dangerouslySetInnerHTML` לא קיים). ערכי cursor/beachId/authorId מאומתים לפני שילוב ב-`.or()`/`.eq()`.
- 404: `/beach/999` ו-`/profile/not-a-uuid` מגיעים ל-`notFound()` (`parseBeachId`/`isUuid`), אך המסך עצמו ברירת מחדל (BUG-021).
- Realtime: סינון `beachId`/`authorId` בהכנסה מה-payload, dedupe לפי id, resync בחיבור מחדש. TTL: חיתוך שרת (`reportCutoffIso`) ולקוח (`dropExpired` כל דקה) תואמים, בכפוף ל-BUG-027.
- `createReport` → `after()`: רק אחרי insert טרי (נתיב 23505 חוזר מוקדם), `notifyFavoriteUsers` עטוף ב-try/catch ולא זורק. Cooldown: 30 דקות לכל משתמש+חוף מ-`push_log`.
- `lib/database.types.ts` מול כל המיגרציות: תואם (עמודות, nullability, `push_log`, `push_enabled`, 3 הפונקציות).
- RTL: grep ל-`ml-/mr-/pl-/pr-/left-/right-/text-left/text-right/rounded-l/r/border-l/r` מחוץ ל-`components/forecast`: אפס תוצאות. Reduced motion: בלוק גלובלי (`*` עם 0.01ms ו-iteration 1) + כיבוי מפורש לכל ה-utilities. `interactiveWidget: "resizes-content"` קיים. `Asia/Jerusalem` ב-greeting, RelativeTime ו-chart.

### ממצאים חדשים

### BUG-019 | high | ✅ fixed (fix: day 13) | מדיניות INSERT על `push_subscriptions` עוקפת את ה-allowlist של SSRF
- **תוקן (יום 13):** מיגרציה `20261029060000_push_insert_lockdown.sql`; הכתיבה כבר עברה דרך `saveSubscription` (admin + ולידציה + user_id מה-session). הבדיקה ב-`tests/security-static.test.ts` עוברת.
- **קבצים:** `supabase/migrations/20261028000000_init_schema.sql:162` (policy "Users add own push subscriptions"), מול `lib/push.ts:107` ו-`lib/push-send.ts` (`deliver`).
- **תרחיש:** משתמש מחובר שולח `POST /rest/v1/push_subscriptions` עם ה-JWT שלו ו-`endpoint` שרירותי (https, כל host ופורט) ומפתחות base64 תקינים. ה-RLS מאפשר (נבדק רק `user_id = auth.uid()`, אין CHECK על endpoint). אחר כך `sendTestPushAction` (פעם בדקה) או דיווח בחוף מועדף גורם לשרת לשלוח POST ל-URL הזה. זה SSRF עיוור, עם oracle בוליאני (`sent` מוחזר ללקוח). גם מגבלת 10 המכשירים נעקפת. `DAY12_PUSH.md` מניח שה-allowlist הוא ההגנה.
- **תיקון:** מיגרציה: `DROP POLICY "Users add own push subscriptions" ON public.push_subscriptions; REVOKE INSERT ON public.push_subscriptions FROM anon, authenticated;` (הכתיבה נעשית ממילא דרך admin). אופציונלי: CHECK על ה-host של endpoint. אחר כך להסיר את ה-`todo` ב-`tests/security-static.test.ts`.

### BUG-020 | medium | ✅ fixed (fix: day 13) | כשל רשת בקריאת server action לא נתפס ב-4 מקומות
- **תוקן (יום 13):** try/catch עם הודעה מוקדמת ו-rollback ב-`loadMore`, `doDelete`, `replyToReport`, `deleteReply` (ובונוס `toggleAccount`); offline: "אין חיבור. נסו שוב".
- **קבצים:** `components/feed/ReportList.tsx:213-221` (`loadMore`), `components/feed/ReportMenu.tsx:38-48` (`doDelete`), `components/feed/ReplyThread.tsx:122` (`replyToReport`), `components/feed/ReplyThread.tsx:238` (`deleteReply`).
- **תרחיש:** מצב טיסה או רשת נופלת. ב-`startTransition(async ...)` חריגה נזרקת ל-error boundary ב-React 19: "טען עוד" או "מחקו" מפילים את כל העמוד ל-`error.tsx`. ב-`ReplyThread` התגובה האופטימית נשארת `pending` לנצח בלי הודעה, ובמחיקת תגובה `busy` נתקע על true והכפתור מת.
- **תיקון:** `try/catch` סביב כל קריאה, הודעת שגיאה מקומית ו-rollback (כמו ב-`ProfileEditForm` וב-`FavoriteToggle`).

### BUG-021 | medium | ✅ fixed (fix: day 13) | אין `not-found.tsx` ואין `global-error.tsx`
- **תוקן (יום 13):** `app/not-found.tsx` (מסקוט, כפתור חזרה לפיד) ו-`app/global-error.tsx`; `/beach/999` ו-`/profile/not-a-uuid` כבר קוראים ל-`notFound()`.
- **קבצים:** `app/` (חסרים), `app/(app)/error.tsx`.
- **תרחיש:** `/beach/999`, `/profile/not-a-uuid` או כל נתיב לא קיים מציגים את דף ה-404 האנגלי של Next בלי RTL, בלי ניווט ובלי מסקוט. שגיאה בשכבת root לא מכוסה בכלל.
- **תיקון:** `app/not-found.tsx` (עברית, `Mascot.Oops`, קישור לפיד) ו-`app/global-error.tsx` מינימלי.

### BUG-022 | low | נתיב ה-push: אין `maxDuration`, וה-cooldown לא אטומי
- **קבצים:** `lib/push-send.ts:392-397` (`push_log` נכתב רק אחרי כל השליחות), `app/actions/reports.ts:71`, `lib/push-send.ts:411-423`.
- **תרחיש:** `after()` רץ תחת ה-timeout של ה-action. אם הפונקציה נחתכת באמצע שליחה (הרבה מנויים, endpoint איטי עד 10 שניות), `push_log` לא נכתב וההתראה תישלח שוב בדיווח הבא. שני דיווחים או שתי בדיקות push במקביל עוברים את בדיקת ה-cooldown (מתועד חלקית ב-DAY12).
- **תיקון:** `export const maxDuration = 30` ב-route שמארח את ה-action, וכתיבת `push_log` לפני השליחה.

### BUG-023 | low | a11y: מזהים כפולים ב-`ConfirmDialog`
- **קובץ:** `components/shared/ConfirmDialog.tsx:38-52` (`confirm-title`, `confirm-desc` קבועים).
- **תרחיש:** כל כרטיס בבעלות המשתמש מרנדר `ReportMenu` עם `<dialog>` סגור, ולכן בפרופיל עם 2+ דיווחים יש id כפול (axe `duplicate-id-aria`).
- **תיקון:** `useId()`. נקודה חיובית: `<dialog>` נטיבי נותן focus trap ו-Escape, והפוקוס הראשוני על "ביטול".

### BUG-024 | low | a11y: `PushOptInSheet` ו-`ReportMenu`
- **קבצים:** `components/push/PushOptInSheet.tsx:126-131`, `components/feed/ReportMenu.tsx:66-85`.
- **תרחיש:** ה-sheet הוא `role="dialog"` בלי העברת פוקוס, בלי Escape; משתמש מקלדת/קורא מסך לא יודע שהוא הופיע, והוא נסגר אוטומטית אחרי 2.5 שניות בהצלחה. ב-`ReportMenu` יש `role="menu"` בלי ניווט חצים.
- **תיקון:** להעביר פוקוס ל"כן, הפעילו" ולהוסיף Escape, או `role="region"` עם `aria-live`.

### BUG-025 | low | מטרות מגע קטנות מ-44px
- **קבצים:** `components/settings/NotificationsCard.tsx:116-120` (מתג 28x48), `components/ui/button.tsx` (`sm`=40px, `xs`/`icon-xs`=32px), כפתורי הטקסט "חידוש" / "השהיה בכל המכשירים" (`NotificationsCard.tsx:157,163`).
- **תיקון:** `min-h-touch` או עוטף שקוף של 44px.

### BUG-026 | low | היגיינת DB קטנה
- **קבצים:** `20261029010000_day7_hardening.sql:58-59` (`guard_*_insert` מבוטלות רק מ-PUBLIC/anon, לא מ-authenticated; פונקציות trigger אינן ניתנות לקריאה ישירה, ולכן אין ניצול), `20261029050000_push.sql:53` + `app/api/cron/purge-images/route.ts:46` (אין GRANT מפורש ל-service_role ל-`purge_old_push_log`, והקריאה לא בודקת שגיאה, כך שכשל נבלע), `profiles` SELECT פתוח לכולם כולל `push_enabled` (מי מפעיל התראות).
- **תיקון:** `REVOKE ... FROM authenticated` ו-`GRANT EXECUTE ... TO service_role` מפורש; לבדוק `error` של ה-RPC; לשקול הסתרת `push_enabled`.

### BUG-027 | low | אזורי זמן ושעוני לקוח
- **קבצים:** `components/profile/ProfileHeader.tsx:9` (`toLocaleDateString("he-IL")` בלי `timeZone`; ב-server UTC תאריך הצטרפות בגבול חודש עלול לצאת חודש אחר), `components/feed/ReportList.tsx:115,151,205` (חיתוך ה-TTL בשאילתות הלקוח לפי שעון המכשיר).
- **תרחיש:** מכשיר עם שעון מוקדם ביותר מ-12 שעות מציג דיווחים שפג תוקפם; שעון מאוחר מסתיר דיווחים חדשים ב-realtime.
- **תיקון:** `timeZone: "Asia/Jerusalem"`; להעביר cutoff מהשרת.

### BUG-028 | low | ליטוש ו-PWA
- **קבצים:** `app/(app)/error.tsx:9` (הטקסט "לא הצלחנו לטעון את הפיד" מוצג גם ב-/new, /settings, /profile), `next.config.ts:14` (`geolocation=(self)` ללא שימוש בקוד; מומלץ `geolocation=()`), `app/layout.tsx` (אין `viewportFit: "cover"`, ולכן `env(safe-area-inset-*)` יהיה 0 ב-iOS standalone; בטוח אך לא edge-to-edge), `app/manifest.ts` (אייקון maskable זהה ל-any, עלול להיחתך).
- **תיקון:** כותרת שגיאה כללית, צמצום Permissions-Policy, אייקון maskable עם safe zone.

### סטטוס 4 הבאגים הנדחים

| באג | סטטוס | חומרה מעודכנת | הערה |
|---|---|---|---|
| BUG-007 | עדיין קיים | low | `fetchHeroSummary` לא בודק `error` (`lib/feed.ts:170-187`), `fetchBeachCircles` מחזיר `[]` (`:215`), וכן `fetchFavoriteBeaches` (`lib/profile-data.ts:36`) ו-`getProfileById` (שגיאת DB מוצגת כ-404). אחרי השקה. |
| BUG-010 | נסגר (מטופל) | closed | `expired_report_image_paths` מוחק כל אובייקט בגיל 12 שעות ומעלה ב-bucket, ולכן יתומים נמחקים (עד ~36 שעות כי ה-cron יומי). |
| BUG-014 | עדיין קיים | low | אין פוקוס לשדה שגוי ב-`NewReportForm` (יש `role="alert"`, ולכן מוקרא); אין `h1` במצב פיד ריק (`ReportList.tsx:240-253`); `OfflineBanner` נוצר יחד עם התוכן. אחרי השקה. |
| BUG-017 | חלקי | low | JetBrains Mono עדיין נטען רק בשביל 5 מונים (`font-mono`), משקל 700 של Plex לא בשימוש (`font-bold` אפס), אין `priority` על תמונת הכרטיס הראשון (`ReportCard.tsx:100`). גודל bundle של `/login` לא נמדד מחדש (ללא build). |

### Perf סטטי

- גופנים: Suez One (400), IBM Plex Sans Hebrew (400/500/600/700, hebrew+latin), JetBrains Mono (latin). אפשר להסיר 700 ואת JetBrains (להחליף ב-`tabular-nums`).
- 28 קבצי `"use client"`; אין קובץ גדול שניתן בקלות להפוך לשרת (`WaveChart` ו-`ReplyThread` אינטראקטיביים).
- `next/image`: `sizes` קיים; אין `priority`.

### פסק דין להשקה

**BLOCKERS למחר:**
1. BUG-019 (high): מיגרציה של שורה אחת (`DROP POLICY` + `REVOKE INSERT`). חובה לפני חשיפת התראות למשתמשים.
2. BUG-021 (medium, מומלץ מאוד): `not-found.tsx` בעברית, כי 404 הוא מסך שמשתמשים עלולים לראות מהיום הראשון (קישור שבור מהתראה).
3. תצורת Vercel (לא באג קוד): `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_*` (כולל `NEXT_PUBLIC_VAPID_PUBLIC_KEY` לפני ה-build), והוספת הדומיין ל-Supabase Auth redirect URLs.

**אחרי השקה:** BUG-020 (רצוי בשבוע הראשון), 022 עד 028, 007, 014, 017.

### צ'קליסט ידני מעודכן

טלפון (iPhone Safari + Android Chrome):
- [ ] התחברות Google מהדומיין הסופי; חזרה ל-`/` ללא לולאה; `/new` כשמנותקים חוזר ל-`/new`.
- [ ] דיווח מלא (חוף+דירוג, טקסט בלבד, תמונה מהמצלמה); מצב טיסה באמצע שליחה (טקסט נשמר, אין כפילות).
- [ ] מצב טיסה: "טען עוד", מחיקת דיווח, שליחת תגובה (BUG-020: כרגע הדף קורס).
- [ ] `/beach/999` ו-`/profile/not-a-uuid`: מסך 404 בעברית (BUG-021).
- [ ] PWA: Android Chrome מציע התקנה (ה-SW נרשם רק אחרי opt-in, לוודא שה-manifest לבדו מספיק); iOS: שיתוף > הוספה למסך הבית, פתיחה משם, אייקון, שורת סטטוס, BottomNav מעל ה-home indicator.
- [ ] Push (Android): ⭐ על חוף > sheet > אישור הרשאה > "שלחו התראת בדיקה" מגיעה; חשבון שני מדווח באותו חוף > מגיעה התראה, לחיצה פותחת `/beach/<id>`; דיווח שני תוך 30 דקות לא שולח; המדווח עצמו לא מקבל.
- [ ] Push (iOS 16.4+): רק מהאפליקציה המותקנת; ב-Safari רגיל מוצג `InstallHint`.
- [ ] כיבוי: מתג ב-`/settings`, "השהיה בכל המכשירים", חסימה בהגדרות המערכת.
- [ ] מקלדת פתוחה ב-`/new` וב-ReplyThread לא מסתירה את כפתור השליחה.
- [ ] טקסט מערכת 130%, Reduce Motion, VoiceOver/TalkBack בפיד ובדיאלוג המחיקה.

מחשב (Chrome + Firefox):
- [ ] ניווט מקלדת מלא (`/new`, דיאלוג מחיקה, תפריט ⋯, מתג התראות); טבעת focus.
- [ ] Realtime בשני חלונות: דיווח חדש (בלי כפילות), `NewReportsPill` בגלילה, תגובת "בא"/"בדרך", מחיקה.
- [ ] `/beach/<id>`: תחזית וגרף, שעות בשעון ישראל, מצב "תחזית לא זמינה" (חסימת הרשת ל-open-meteo).
- [ ] אבטחה: `curl` ל-`/api/cron/purge-images` ול-`/api/push/send` בלי סוד או עם סוד שגוי = 401; עם הסוד הנכון = 200.
- [ ] אבטחה (אחרי תיקון BUG-019): `POST /rest/v1/push_subscriptions` עם JWT של משתמש ו-endpoint שרירותי נדחה.
- [ ] `/login?next=https://evil.com` ו-`//evil.com` נוחתים ב-`/`.
- [ ] DevTools: `/sw.js` מוגש עם `no-cache`; headers של האבטחה קיימים; Console נקי משגיאות.
