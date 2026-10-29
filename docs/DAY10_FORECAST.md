# יום 10: תחזית Open-Meteo (גלים + רוח) ומטמון

שכבת הנתונים של התחזית האוטומטית. ה-UI (גרף ודף חוף) הוא יום 11.

> **תחזית אוטומטית ≠ דיווח גולשים.** הכול כאן הערכת מודל. כל רכיב UI שמציג אותה חייב להציג את `summary.label`
> ("תחזית אוטומטית (הערכה, לא דיווח גולשים)") או תווית שקולה, כדי להבדיל מדיווחים אנושיים (UX_SPEC).

## קבצים

| קובץ | תפקיד |
| --- | --- |
| `lib/forecast-types.ts` | טיפוסים משותפים לצד לקוח ושרת (ללא imports). `BeachForecast`, `ForecastPoint`, `ForecastSummary`, `ForecastErrorBody` |
| `lib/openMeteo.ts` | קריאות ל-API, מיזוג, label כיוון, אופשור/אונשור, ציון. טהור, `fetch` ניתן להזרקה (בדיקות בלי רשת) |
| `lib/forecast.ts` | `getBeachForecast(beachId)` (server-only): שליפת קואורדינטות מ-Supabase (anon, בלי cookies) + תחזית |
| `app/api/forecast/[beachId]/route.ts` | `GET /api/forecast/:beachId` |
| `tests/forecast.test.ts`, `tests/fixtures/openmeteo-*.json` | בדיקות (fixture קצוץ של הילטון ת"א, 6 שעות) |

## מקורות

1. **Marine** `https://marine-api.open-meteo.com/v1/marine`: `wave_height, wave_period, wave_direction, swell_wave_height, swell_wave_period, swell_wave_direction, wind_wave_height, sea_surface_temperature`, `cell_selection=sea`.
2. **Weather** `https://api.open-meteo.com/v1/forecast`: `wind_speed_10m, wind_direction_10m, wind_gusts_10m`, `wind_speed_unit=kmh`.

שניהם: `timezone=Asia/Jerusalem`, `forecast_days=3` (72 שעות), נקראים במקביל.
`cell_selection=sea` מבקש את תא הרשת הימי הקרוב, כדי שחוף שנופל על תא יבשתי יחזיר נתוני ים.

## מודל הנתונים

```ts
BeachForecast {
  beachId, fetchedAt (ISO UTC), source: "open-meteo", units,
  marineAvailable, windAvailable,      // false = אחד ה-API נכשל, השדות שלו null
  points: ForecastPoint[],             // 72 שעות, ממוין
  now: ForecastPoint | null,           // השעה הקרובה ביותר לעכשיו (null אם רחוקה מ-3 שעות)
  summary: ForecastSummary
}
ForecastPoint { time ("2026-10-29T14:00+02:00"), waveHeight, wavePeriod, waveDirection,
  swellHeight, swellPeriod, swellDirection, windWaveHeight, windSpeed, windDirection, windGusts, seaTemp }  // כולם number|null
ForecastSummary { kind: "automatic-forecast", label, waveHeight, wavePeriod, waveDirection, waveDirectionLabel,
  windSpeed, windDirection, windDirectionLabel, windHint, windHintLabel,
  todayMinWaveHeight, todayMaxWaveHeight, score (1-5|null), scoreLabel }
```

יחידות: מטר, שניות, מעלות, קמ"ש, צלזיוס. כיוונים (גלים ורוח) הם מאיפה הם **באים** (0 = צפון, עם כיוון השעון).
`time` כולל offset של ישראל (`+02:00`/`+03:00`), לכן `new Date(time)` נכון בכל מכשיר. "היום" ב-`todayMin/Max` הוא התאריך הישראלי של `now`.

## Endpoint

`GET /api/forecast/:beachId` (ציבורי, ב-`PUBLIC_PATHS` ב-middleware).

| מצב | סטטוס | גוף |
| --- | --- | --- |
| תקין | 200 | `BeachForecast` + `Cache-Control: public, s-maxage=1800, stale-while-revalidate=3600` |
| `beachId` לא מספר שלם חיובי | 400 | `{"error":"invalid_beach_id"}` |
| חוף לא קיים | 404 | `{"error":"beach_not_found"}` |
| שני ה-API נכשלו / אין נתונים | 502 | `{"error":"forecast_unavailable"}` (ה-UI: "תחזית לא זמינה כרגע"), `no-store` |

כשרק API אחד נכשל מחזירים 200 עם `windAvailable:false` או `marineAvailable:false`.
שגיאות גולמיות לעולם לא מגיעות ללקוח. timeout של 6 שניות לכל קריאה (`AbortSignal.timeout`).

לשימוש ב-SSR: `getBeachForecast(id)` מ-`lib/forecast.ts` מחזיר `{ ok: true, forecast } | { ok: false, reason: "not_found" | "unavailable" }` ולא זורק.

## מטמון

- שכבה 1, Next data cache: `fetch(..., { next: { revalidate: 1800, tags: ["forecast:<id>"] } })`. ה-route וה-SSR חולקים אותה. אפשר לנקות ידנית עם `revalidateTag("forecast:7")`.
- שכבה 2, CDN: `s-maxage=1800, stale-while-revalidate=3600` על תשובת ה-route.
- `fetchedAt` הוא זמן בניית האובייקט, והנתונים שמאחוריו יכולים להיות ישנים עד 30 דקות. ל"עודכן לפני X דקות" זה קירוב.
- אין rate limit נוסף: הקלט הוא מספר שלם שחייב להתקיים ב-`beaches`, וכל בקשה נופלת על upstream ממוטמן, כך שאי אפשר להעצים עומס על Open-Meteo.

## ציון גלישה (1-5), היוריסטיקה

`score = round(clamp(בסיס גובה + תיקון מחזור + תיקון רוח, 1, 5))`. כל הערכים ב-`SCORE_CONFIG` ב-`lib/openMeteo.ts` וניתנים לכוונון.

| גורם | כלל |
| --- | --- |
| גובה (מ') | <0.3: 1, <0.6: 2, <1.0: 3, <1.5: 3.5, <2.5: 4, מעל: 3 (גדול מדי לרוב הגולשים) |
| מחזור (שנ') | ≥9: +1, ≥7: +0.5, ≥5: 0, מתחת: -0.5 |
| רוח | חלשה (<8 קמ"ש): +0.5, אופשור עד 25 קמ"ש: +0.5, אונשור ≥12: -0.5, אונשור ≥20: -1, כל כיוון ≥30: עוד -0.5 |

תוויות: 1 שטוח, 2 חלש, 3 סביר, 4 טוב, 5 מצוין. אם גובה הגל לא ידוע, הציון `null`. אם הרוח לא זמינה, אין תיקון רוח.
זו הערכה גסה: בלי גאות ושפל, בלי התאמת כיוון הסוול לחוף, ובלי batimetry מקומי. אין לה ערך מעבר ל"אינדיקציה".

## אופשור / אונשור (פישוט מתועד)

חוף ישראל פונה בערך **מערבה**, לכן רוח מזרחית (שנושבת מ-90°) היא אופשור ורוח מערבית (מ-270°) אונשור.
המרחק הזוויתי מ-90°: ≤60° אופשור (רוח מ-30° עד 150°), ≥120° אונשור (מ-210° עד 330°), ביניהם צדדית. מתחת ל-8 קמ"ש: "רוח חלשה".
בפועל לכל חוף כיוון משלו (מפרץ חיפה, אשדוד וכו' סוטים ב-10-30°), ואין כאן אוריינטציה פר חוף. אפשר להוסיף עמודה `facing_deg` ב-`beaches` בעתיד.

## בדיקה חיה (29.10.2026)

הילטון (32.0885, 34.7705) ובת גלים (32.8285, 34.9690), 72 שעות, עם וגם בלי `cell_selection=sea`: **כל העמודות 72/72 לא-null בכל ארבע הקריאות**.
ה-API ממפה כל נקודה לתא ימי גם בלי הפרמטר (הילטון -> 32.125, 34.708; בת גלים -> 32.875, 34.958), כלומר `cell_selection=sea` כרגע לא משנה כאן, אבל הוא חוסך אותנו מחוף שייפול על תא יבשתי. הפרמטר התקבל ללא שגיאה.
שימו לב: תא הרשת הימי רחוק עד כ-5 ק"מ מהחוף (רזולוציה ~0.08°), לכן הנתונים משקפים ים פתוח ולא ברייקים ספציפיים.

## רישיון

Open-Meteo חינמי לשימוש **לא מסחרי** (פרויקט פורטפוליו מתאים). שימוש מסחרי דורש תוכנית בתשלום ו-API key. מגבלה חינמית: כ-10,000 קריאות ביום (שתי קריאות לחוף ל-30 דקות). מומלץ לשמור קרדיט "Weather data by Open-Meteo.com" (CC BY 4.0) בדף על/הגדרות.

## איך לנסות

```bash
pnpm dev
curl http://localhost:3000/api/forecast/7          # 200 + JSON
curl -i http://localhost:3000/api/forecast/9999    # 404 beach_not_found
curl -i http://localhost:3000/api/forecast/abc     # 400 invalid_beach_id
node --test tests/forecast.test.ts
```
