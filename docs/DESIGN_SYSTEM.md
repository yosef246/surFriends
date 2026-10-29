# surFriends — Design System v3 ("Sea")

> מחליף את v2 (Sunset). מקור הטוקנים בקוד: `app/globals.css`. המסמך מגדיר מראה בלבד; מבנה וזרימות ב-`docs/UX_SPEC.md`. שמות הטוקנים הם שמות ה-utility של Tailwind v4. Light only; dark mode מחוץ ל-scope. ללא ספריות חדשות: כל התנועה CSS בלבד.

## 1. כיוון עיצובי

האפליקציה נראית כמו הים: רקע דף שהוא מעבר עדין משמיים בהירים (`#EAFBFE`) למים רדודים (`#C9EEF4`), כרטיס hero בגרדיאנט אוקיינוס עמוק → טורקיז, כרטיסים לבנים או זכוכית חלבית (לבן 78% + blur) מעל הים. צבע הפעולה: **טורקיז חי `#1CC8DA`** עם **טקסט נייבי (ink), לא לבן**. כפתורים בועתיים (פיל, ברק עליון, צל כחול-ים, קפיצה בלחיצה), כותרות Rubik Medium עם אפשרות גרדיאנט כחול→טורקיז, תוויות "eyebrow" מרווחות, וקו גל מצויר מתחת לכותרת מפתח. תנועה קפיצית ורכה. המסקוט: **גל**, גולש צעיר עם משקפי שמש. הכל כחול; **מבטא חם יחיד ומכוון: אלמוג `#FF6B57` ל"חי" ולתגי התראה בלבד** (לא לכפתורים, לא לכותרות). רפרנס: Yellow (מבנה) + Apple-ים-תיכוני רך (זכוכית ובועות).

כלל ברזל: **לבן על טורקיז נכשל AA (2.03:1)** → על `signature` תמיד `text-ink`. על ה-hero הכהה → תמיד טקסט לבן, **לא ink**.

## 2. פלטת צבעים

### 2.1 סקאלת הים (כהה → בהיר)

| Token | Hex | תפקיד |
|---|---|---|
| `abyss` | `#04213D` | עומק מרבי: overlays, גרדיאנט עמוק |
| `ocean-deep` | `#06335C` | תחילת גרדיאנט ה-hero |
| `ocean` | `#0B6C9E` | אמצע ה-hero, איורים |
| `signature` / `turquoise` | `#1CC8DA` | **פעולה ראשית (fill בלבד)**, FAB, פסי התקדמות |
| `aqua` | `#7FE3EE` | נצנוצים, גלי SVG, מילוי דקורטיבי (לא טקסט על בהיר) |
| `sky` | `#C9EEF4` | תחתית גרדיאנט הדף |
| `foam-blue` | `#EAFBFE` | ראש גרדיאנט הדף |
| `foam` | `#F4FDFF` | "לבן" של מסכים נקיים (login) |

### 2.2 תפקידים

| Token | Hex | תפקיד |
|---|---|---|
| `signature` / `-hover` / `-pressed` / `-soft` | `#1CC8DA` / `#12B5C9` / `#0AA2B8` / `#DDF8FB` | פעולה ראשית, מצבים, רקע נבחר |
| `orange-text` (alias, עכשיו טורקיז כהה) | `#07707F` | טקסט טורקיז: eyebrow, ספירות, "חי" כטקסט שאינו אלמוג |
| `ink` / `sea-deep` | `#062B4A` | כותרות, מספרים, טקסט על טורקיז, אייקונים |
| `copy` / `shadow` | `#1F3F57` | גוף טקסט |
| `muted-text` / `mist-text` | `#456479` | משני, תוויות, זמנים |
| `surface` / `sand` / `muted` | `#E3F6F9` | צ'יפים לא פעילים, שדות כבויים, פאנלים |
| `card` | `#FFFFFF` | כרטיס אטום; לזכוכית ראו `glass-card` |
| `line` / `border` | `#CDE9EF` | קווי הפרדה דקורטיביים בלבד |
| `mist-border` / `input` | `#4F8196` | גבול שדות וכפתורי outline |
| `link-blue` / `link` / `ring` | `#0B6A8F` | קישורים, תג "חדש", focus |
| `link-soft` / `accent` | `#DDF3F9` / `#DDF3F9` | hover עדין |
| `sea-wave` | `#1AA7D8` | דקורטיבי בלבד (איורים, גרפים) |
| `mist` | `#7FB4C6` | דקורטיבי בלבד |
| `kelp` / `success` | `#0F7B5F` | הצלחה |
| `danger` / `destructive` | `#C62828` | שגיאה |
| `live` / `coral` | `#FF6B57` | **המבטא החם היחיד.** נקודת "חי", תג "חי", באדג'ים של התראות. fill בלבד, טקסט עליו `ink` |
| `live-text` / `coral-text` | `#B83A0A` | אלמוג כטקסט |
| `sunset`, `sunset-text` | `#1CC8DA`, `#07707F` | aliases ישנים, deprecated |

### 2.3 גרדיאנטים (CSS vars + utilities)

| Var | ערך | שימוש |
|---|---|---|
| `--gradient-page` | `180deg #EAFBFE → #D9F4F8 45% → #C9EEF4` | רקע ה-`body` (אוטומטי), `bg-sea-page` |
| `--gradient-hero` | `160deg #06335C → #0B6C9E 55% → #0C7FA6` | `bg-hero-sea` (כולל זוהר טורקיז עדין בפינה התחתונה-שמאלית, שם המסקוט) |
| `--gradient-action` | `180deg #4ADBE8 → #1CC8DA 60% → #14BCD0` | כפתור ראשי, צ'יפ נבחר |
| `--gradient-fab` | `160deg #5BE3EE → #1CC8DA → #0B9FC4` | כפתור "דיווח" בניווט |
| `--gradient-text` | `100deg #083D6E → #07707F` | `text-gradient-sea` |
| `--gradient-text-light` | `100deg #FFFFFF → #A5F3FA` | `text-gradient-sea-light` (על ה-hero) |

### 2.4 טבלת ניגודיות (WCAG, מחושב)

| חזית על רקע | יחס | תוצאה | הערה |
|---|---|---|---|
| `ink` על `signature` `#1CC8DA` | 7.11 | AAA | כפתורים, FAB |
| `ink` על hover `#12B5C9` / pressed `#0AA2B8` | 5.84 / 4.73 | AA | |
| `ink` על כל עצירות `--gradient-action` (עד `#14BCD0`) | ≥ 6.29 | AA | |
| `ink` על `--gradient-fab` (עד `#0B9FC4`) | ≥ 4.66 | AA | |
| **לבן** על `signature` | **2.03** | **נכשל** | אסור |
| `ink` על `signature-soft` | 13.2 | AAA | |
| לבן על `ocean-deep` `#06335C` | 12.8 | AAA | hero, תחילה |
| לבן על `ocean` `#0B6C9E` | 5.75 | AA | hero, אמצע |
| לבן על `#0C7FA6` (סוף ה-hero) | 4.56 | AA | המינימום ב-hero: אסור לוותר על הערך הזה |
| `#A5F3FA` על `ocean` `#0B6C9E` / על `ocean-deep` | 4.6 / 9.1 | AA | `eyebrow-light` רק בחצי העליון/ימני של ה-hero. לא בפינה התחתונה (3.65) |
| `ink` על לבן / `surface` / `sky` | 14.5 / 13.0 / 11.7 | AAA | |
| `copy` על לבן / `sky` | 11.0 / 8.9 | AAA | |
| `muted-text` על לבן / `surface` / `sky` | 6.2 / 5.6 / 5.1 | AA | |
| `orange-text` `#07707F` על לבן / `surface` / `sky` | 5.78 / 5.18 / 4.68 | AA | eyebrow, טקסט טורקיז |
| `link-blue` על לבן / `surface` / `sky` | 6.05 / 5.4 / 4.9 | AA | |
| לבן על `link-blue` | 6.05 | AA | תג "חדש" |
| גרדיאנט טקסט (`#083D6E→#07707F`) על לבן / `sky` | ≥ 5.78 / ≥ 4.68 | AA | הקצה הבהיר `#07707F` הוא המינימום |
| `#A5F3FA`→לבן על עצירות עליונות של ה-hero | ≥ 4.6 | AA | `text-gradient-sea-light` רק למעלה |
| `ink` על `live` `#FF6B57` | 5.16 | AA | תג "חי" |
| `coral-text` `#B83A0A` על לבן / `sky` | 5.76 / 4.67 | AA | |
| `mist-border` על לבן / `sky` | 4.28 / 3.46 | 3:1 UI | גבול שדה |
| `#0E9FB3` (גבול כפתור זכוכית) על לבן | 3.17 | 3:1 UI | התווית מזהה את הכפתור בכל מקרה |
| `kelp` / `danger` על לבן | 5.23 / 5.62 | AA | |
| טקסט על `glass-card` (לבן 78%) מעל `sky` | כמו על `sky` או טוב יותר | AA | לא לרדת מ-78% אטימות |

כללי שימוש: טורקיז/אקווה בהיר **אף פעם לא כטקסט** על רקע בהיר. טקסט טורקיז = `text-orange-text` (`#07707F`). טקסט כחול = `text-link`. אינפורמציה אף פעם לא בצבע בלבד.

## 3. טיפוגרפיה (עיצובי טקסט)

Rubik, משקלים 300 / 400 / 500. כותרות Medium עם `letter-spacing: -0.01em`; `font-bold`/`font-semibold` מוגדרים כ-500. סקאלה (ללא שינוי): `text-numeral-xl/lg/md`, `text-unit`, `text-display` 28/34, `text-title` 22/28, `text-heading` 18/24, `text-body` 16/24, `text-body-sm` 14/20, `text-caption` 12/16, `text-data` 13/18 mono.

### Utilities חדשים (ב-`globals.css`)

| Class | מה עושה | איפה משתמשים |
|---|---|---|
| `text-gradient-sea` | טקסט בגרדיאנט כחול-עמוק→טורקיז-כהה (`background-clip:text`), fallback `ink` אם אין תמיכה | כותרת ברכה ("ערב טוב יונתן"), מספרי hero על רקע בהיר, מספר גל גדול בכרטיס. גדלים ≥ 22px |
| `text-gradient-sea-light` | לבן→אקווה בהיר, fallback לבן | כותרת/מספר גדול בתוך `bg-hero-sea` (חצי עליון) |
| `eyebrow` | 12px, Medium, ריווח `0.14em`, אותיות גדולות ללטינית, צבע `#07707F`, נקודת טורקיז קטנה לפני | מעל כותרות סקציה ("החופים שלך", "דיווחים אחרונים") |
| `eyebrow-light` | מוסיף צבע `#A5F3FA` (לשלב עם `eyebrow`) | על ה-hero |
| `numeral` | ספרות tabular, ריווח `-0.04em`, ltr | כל מספר גדול (נשאר + הידוק) |
| `heading-tight` | `letter-spacing -0.025em`, line-height 1.15, `text-wrap:balance` | כותרות מסך, display |
| `prose-he` | line-height 1.7, `text-wrap:pretty` | פסקאות עברית ארוכות (תיאור דיווח, הסברים) |
| `wave-underline` | קו גל SVG טורקיז מתחת (`::after`), מתחבר עם `text-gradient-sea` | **מקסימום 1-2 כותרות**: ברכת הבית וכותרת ה-EmptyState/login |

דוגמה:
```
<p class="eyebrow">החופים שלך</p>
<h1 class="text-display heading-tight text-gradient-sea wave-underline">ערב טוב יונתן</h1>
```
על `text-gradient-sea` לא לשים `text-ink`/צבע אחר (`color` נעשה שקוף); לא מתחת ל-22px.

## 4. ריווח ופריסה
סקאלת 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64). `max-w-feed` 576px. Gutter 16/24px. ריפוד כרטיס 16-20px. מרווח בין כרטיסים 12-16px, בין סקציות 24-32px. יעד מגע ≥ 44px; כפתורים ראשיים ≥ 48px. תוכן אחרון: padding תחתון `bottomnav + 24px + safe-area`.

## 5. רדיוסים, צללים, זכוכית

| Token | ערך | שימוש |
|---|---|---|
| `rounded-card` / `rounded-xl` | 24px | כרטיסים, hero, sheets |
| `rounded-pill` / `rounded-full` | ∞ | כפתורים, צ'יפים, תגים, אריחים |
| `rounded-lg` | 14px | שדות קלט, תמונות בכרטיס |

צללים (כולם מגוון כחול-ים `rgb(6 74 122)` / טורקיז, **לא אפור**): `shadow-card`, `shadow-bubble` (כפתור ראשי), `shadow-raised` = `shadow-fab` (טורקיז חזק, כפתור הניווט), `shadow-hero`, `shadow-nav`, `shadow-sheet`.

משטחים:
- `bg-sea-page`: גרדיאנט הדף (על ה-`body` כבר מוחל).
- `glass-card`: לבן 78% + `backdrop-blur 14px` + גבול לבן 70% + `shadow-card`. כרטיס ברירת מחדל (או `bg-card shadow-card` אטום).
- `glass-bar`: לבן 85% + blur 16px: header דביק וסרגל ניווט.
- `bg-hero-sea`: ה-hero (גרדיאנט + זוהר + קצה עליון בהיר). טקסט: **לבן בלבד**.

## 6. RTL
`dir="rtl"`; logical properties בלבד (`ms/me/ps/pe/start/end`); הפריט הראשון ב-DOM מימין. מספרים ב-`numeral`/`<bdi>`. חצים `rtl:-scale-x-100`. המסקוט לא מתהפך (ה-hero: הוא בצד end = שמאל, והזוהר הטורקיז בפינה התחתונה-שמאלית בכוונה). גלי ה-drift מתהפכים אוטומטית דרך `--drift-dir`.

## 7. מערכת תנועה (CSS בלבד)

### טוקנים
| Token | ערך |
|---|---|
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` קפיצי, ל-pop/hover/לחיצה |
| `--ease-out-soft` | `cubic-bezier(.22,1,.36,1)` חלק, ל-fade/page |
| `--ease-standard`, `--ease-press` | יציאות/מעברים רגילים |
| `--dur-instant` 80 · `--dur-fast` 140 · `--dur-base` 220 · `--dur-slow` 400 · `--dur-ambient` 14s | משכים |

### Keyframes + utilities
| Utility | Keyframe | משך | איפה משתמשים |
|---|---|---|---|
| `motion-fade-up` | `fade-up` (14px למעלה + fade) | 520ms, השהיה `calc(var(--i)*40ms)` | פריטי רשימה: `style={{"--i": index}}` על ReportCard, שורת BeachCircle, שורות הגדרות |
| `motion-pop-in` | `pop-in` (scale .9→1 עם overshoot) | 420ms (גם `--i`) | אריחי BeachCircle, צ'יפים, כרטיס hero, EmptyState, מודאלים |
| `motion-float` / `animate-mascot-bob` | `float` (±6px + רוק 1.5°) | 3.6s אינסוף | מסקוט ב-hero ובלוגין. ב-EmptyState: סטטי |
| `motion-drift` / `motion-drift-slow` | `wave-drift` (translateX 50%) | 14s / 24s אינסוף | רצועת SVG גלים בתחתית ה-hero/login: האלמנט `w-[200%]` בתוך הורה `overflow-hidden`, האיור מחזורי כל 50% מרוחבו. שתי שכבות (אחת slow, שקופה יותר) לעומק |
| `animate-shimmer`, `skeleton` | `shimmer` | 1.4s | מצבי טעינה (מותאם לאקווה) |
| `motion-pulse-ring` / `animate-live-pulse` | `pulse-ring` (טבעת אלמוג) | 2s אינסוף | **נקודת "חי"** בלבד |
| `motion-squish` / `animate-squish` | `squish` (1.1×.9 → .95×1.06 → 1) | 480ms | אישור הצלחה: אחרי שליחת דיווח, בחירת דירוג, הוספת חוף |
| `motion-press` | `:active scale .97` | 140ms spring | קלפים/אריחים לחיצים שאינם `Button` |
| `motion-lift` | `:hover translateY(-3px)` | 220ms spring | כרטיסים ואריחים (desktop) |
| `motion-page` / `animate-page-enter` | `page-enter` (10px + fade) | 420ms | עטיפת `<main>` בכל עמוד |
| `animate-card-in`, `animate-pill-in`, `animate-toast-in`, `animate-count-pop` | קיימים, עכשיו עם spring | | דיווח חדש בפיד, צ'יפים, toast, ספירה |

Hover lift וכפתורים (`bubble-*`) מוגדרים ב-§8. כל hover רק על אלמנטים אינטראקטיביים. אין parallax.

### Reduced motion
תחת `prefers-reduced-motion: reduce`: כל משכי האנימציה/מעבר ל-0.01ms; **כל** utilities האנימציה (`motion-*`, `animate-*` הלולאתיים והכניסה, `skeleton`) → `animation: none`; hover-lift ו-squish של הכפתורים והצ'יפים מבוטלים (`transform:none`). אין מידע שעובר בתנועה בלבד.

## 8. כפתורים בועתיים (`components/ui/button.tsx`)

מבנה: פיל מלא, ברק עליון (inset highlight 2px + גרדיאנט לבן-שקוף ב-52% העליונים), צל כחול-ים רך, hover: עלייה 2px + בהירות; active: **squish** (`scale .96`, הצל מצטמצם, inset פנימי). מעבר spring 220ms. Focus: outline גלובלי (לא box-shadow).

| Variant | Class | מראה | טקסט |
|---|---|---|---|
| `default` / `accent` (ראשי) | `bubble-primary` | גרדיאנט טורקיז, גבול לבן 45%, `shadow-bubble` | `ink` |
| `secondary` | `bubble-glass` | זכוכית (לבן 60% + blur) + גבול טורקיז `#0E9FB3` 1.5px | `ink` |
| `soft` (חדש) | `bubble-soft` | מילוי אקווה בהיר, בלי גבול | `ink` |
| `outline` | `bubble-outline` | לבן + גבול `input`; hover `accent` | `ink` |
| `ghost` | `bubble-ghost` | שקוף; hover טורקיז 14% | `ink` |
| `destructive` | `bubble-danger` | אדום עם ברק | לבן (5.62) |
| `link` | `text-link` | קישור | `link` |

גדלים (API זהה, גבהים עודכנו): `default` h-48 · `lg` h-56 (CTA מלא רוחב) · `sm` h-40 · `xs` h-32 · `icon` 48 · `icon-sm` 40 · `icon-xs` 32 · `icon-lg` 56. מצב `disabled`: opacity .5, בלי hover/lift. טעינה: ספינר `animate-spin` ב-ink.

צ'יפים: `bubble-chip` (גובה 36-40, ריפוד `0 16px`, `text-body-sm font-medium rounded-pill`). לא נבחר: זכוכית לבנה 80% + גבול `#BFE6EE`; נבחר (`aria-pressed|aria-checked="true"`, `data-selected="true"` או `data-state="on"`): נראה כמו `bubble-primary` קטן. לחיצה: scale .95.

כפתור "דיווח" בניווט: class `bubble-fab` על עיגול 56px (ראו §10).

## 9. המסקוט: "גל" (Gal)

**גולש צעיר, שזוף ושמש-מולבן, מאחורי משקפי שמש שחורים.** האישיות: רגוע, מחייך תמיד, "אחי, הים מחכה", אופטימי גם כשהים שטוח, אבל מופתע בגדול כשהמשקפיים נופלים. הטון בטקסטים: חם, קליל, בלי ציניות.

דמות chibi (ראש גדול, גוף קטן): שיער בלונדיני-שמש פרוע עם קווצה עומדת; עור שזוף `#EDAA77`; משקפי שמש כהים (`#0F3556`) עם ברק לבן ופס טורקיז; חיוך רחב עם שיניים; גופיית רש-גארד `#0B6C9E` עם פסי טורקיז; בורדשורט נייבי `#06335C` עם פס טורקיז; לוח גלישה לבן עם פס טורקיז. מסגרת ink 3.5px אחידה. ללא כתום/אלמוג בדמות.

קבצים: `components/mascot/` (`MascotWave.tsx`, `MascotWaiting.tsx`, `MascotOops.tsx`, `parts.tsx` משותף, `index.ts`). API זהה: `import { Mascot } from "@/components/mascot"`, `<Mascot.Wave size={140} />`. Props: `size` (ברירת מחדל 160, מתוכנן ל-96-220), `className`. `role="img"` + `aria-label` בעברית. SVG inline, בטוח ל-Server Components, כל קובץ ממיר ל-SVG מתחת ל-7KB.

| פוזה | מתי | תיאור |
|---|---|---|
| `Mascot.Wave` | login, hero, onboarding | שאקה 🤙 ביד אחת, הלוח מוחזק בצד השני |
| `Mascot.Waiting` | EmptyState | יושב על הלוח בים שטוח, סנטר על היד, בועת "..." |
| `Mascot.Oops` | שגיאה, offline | משקפיים מחליקים על האף (העיניים נחשפות), טיפת זיעה, ידיים למעלה, הלוח שבור לשניים |

כללים: ≥ 96px. לא מתהפך ב-RTL. לא שני מסקוטים במסך. על ה-hero הכהה הדמות קריאה בזכות המילוי (הקווים הכהים נבלעים בכוונה). הוא דקורטיבי: הכותרת וההסבר חייבים להיות בטקסט.

## 10. רכיבים

### Greeting header
`glass-bar` או שקוף על גרדיאנט הדף; `eyebrow` ("שלום") אופציונלי; ברכה `text-display heading-tight text-gradient-sea` ושם פרטי, עם `wave-underline` (הפעם היחידה בעמוד). שורה שנייה `text-body-sm text-muted-text prose-he`. אווטר 40px עגול `bg-secondary text-ink`. `motion-page`.

### BottomNav + כפתור "דיווח"
- סרגל: `glass-bar` + `rounded-t-card`, גובה `bottomnav` + safe-area.
- 3 פריטים: אייקון 20 + `text-caption font-medium`. פעיל: `text-ink`, כדור רקע `signature-soft` מאחורי האייקון (pill 32×56) + תווית; לא פעיל `muted-text`. מעבר spring.
- **"דיווח"**: אחרון ב-DOM (שמאל ב-RTL). עיגול 56px, class `bubble-fab` (גרדיאנט `--gradient-fab`, ברק, `shadow-raised`), אייקון `Plus` 28 ב-`ink`, מורם על קצה הסרגל, טבעת `ring-4 ring-white/80`. hover: lift + scale 1.04; לחיצה: scale .92. תווית "דיווח" `text-caption font-medium text-ink`. `aria-label="דיווח חדש"`.

### Hero summary card
`bg-hero-sea rounded-card overflow-hidden p-5 min-h-[176px]` + `motion-pop-in`. **כל הטקסט לבן.** תוויות: `eyebrow eyebrow-light` ("סיכום חי"), משפט ראשי `text-heading text-white`, גובה גל `numeral text-numeral-xl font-light text-gradient-sea-light` + `text-unit text-white` ("מ'"), שם החוף `text-body-sm text-white`. צד end: `Mascot.Wave size={120}` עם `motion-float` (מותר לגלוש 8px). בתחתית: שתי רצועות גלי SVG אקווה (`aqua` ב-20%/35% אטימות) עם `motion-drift` ו-`motion-drift-slow`, `pointer-events-none`, מאחורי הטקסט. כפתור משני בתוך ה-hero: `bubble-soft` או pill לבן, ink. פס התקדמות: track לבן 25%, מילוי `aqua`. בלי נתונים: EmptyState במקום ה-hero. אסור טקסט בפינה התחתונה-שמאלית.

### BeachCircle row
גלילה אופקית (`snap-x`, בלי scrollbar), `gap-4`. אריח: עיגול 64px `glass-card` (או `bg-card shadow-card`) עם אייקון 24 ב-`ink`, תווית `text-caption font-medium text-copy truncate`; `motion-pop-in` עם `--i`; hover `motion-lift`, לחיצה `motion-press`. נבחר: טבעת 2px טורקיז + `signature-soft`. תג **"חי"**: pill 18px `bg-live text-ink text-caption font-medium` בפינת end העליונה, עם נקודה קטנה `bg-live` + `motion-pulse-ring` (המילה "חי" נשארת). תג "חדש": `bg-link-blue text-white`. אריח "הוסף חוף": עיגול מקווקו `border-dashed border-input` + `Plus`.

### ReportCard
`glass-card rounded-card p-4` (או `bg-card shadow-card`), `motion-fade-up` עם `--i`. שורה עליונה: אווטר 36 + שם `font-medium text-ink` + זמן `text-body-sm text-muted-text`; תג חוף `text-link font-medium`. גובה גל: `numeral text-numeral-lg font-light text-gradient-sea` (יחידה `text-unit text-muted-text`) ב-end, לצד `WaveRating`. גוף `text-body text-copy prose-he`. תמונה `rounded-lg`. דיווח טרי (≤15 דק'): תג "חי" אלמוג. Skeleton: `skeleton rounded-card`. `motion-press` אם כל הכרטיס לחיץ.

### WaveRating / WaveRatingInput
תצוגה: 5 נקודות; מלאה `signature` (עם הטקסט/מספר לצדה), ריקה `surface` + גבול `line`. קלט: צ'יפים `bubble-chip` בגובה 44; נבחר = מצב נבחר של הצ'יפ + `motion-squish` בבחירה.

### BigNumber
`numeral` + שני spans; props כמו קודם. `tone`: `ink` / `on-hero` (לבן + `text-gradient-sea-light`) / `gradient` (`text-gradient-sea`). `aria-label` מלא על העטיפה.

### Chips / תגים
צ'יפ: `bubble-chip`. תג מידע: `text-caption font-medium rounded-pill h-5 px-2`. "חדש" `bg-link-blue text-white`; "חי" `bg-live text-ink`; הצלחה `bg-success text-success-foreground`; badge התראה `bg-live text-ink` (המקום השני והאחרון של האלמוג).

### Buttons
ראו §8.

### Inputs (קלט, BeachPicker, textarea)
`bg-white/90` (אטום ≥ 90% כדי לשמור ניגודיות), `border-[1.5px] border-input`, `rounded-lg` (14px) — או `rounded-pill` בשדה חיפוש, גובה 48, ריפוד `12px 16px`, `text-body text-copy`, placeholder `text-muted-text`. Focus: `border-link-blue` + `ring-3 ring-link/25`, מעבר 140ms. שגיאה: `border-danger` + `text-body-sm text-danger` + `AlertCircle`. Disabled: `bg-surface text-muted-text`. תווית: `text-body-sm font-medium text-ink`.

### PhotoField
`rounded-card border-2 border-dashed border-input glass-card`, `Camera` 24 + "הוסף תמונה" `font-medium text-ink`; hover `motion-lift`. תצוגה מקדימה `rounded-lg` עם `motion-pop-in`.

### OfflineBanner / PostedNotice / InAppBrowserNotice
- OfflineBanner: `bg-ocean-deep text-white` (12.8:1), `WifiOff` 16; בעמוד שגיאה מלא + `Mascot.Oops size=96`.
- PostedNotice (toast): `bg-success text-success-foreground rounded-pill shadow-raised animate-toast-in`, בהצלחה `motion-squish` על האייקון.
- InAppBrowserNotice: `glass-card rounded-card`, כותרת ink Medium.

### EmptyState
ממורכז: `Mascot.Waiting size={160}` (סטטי, או `motion-float` עדין), `eyebrow` אופציונלי, כותרת `text-heading heading-tight text-ink` ("הים שטוח כרגע") עם `wave-underline` אם זה המסך הראשי, הסבר `text-body-sm text-muted-text prose-he` עד 2 שורות, CTA `Button` ראשי ("היה הראשון לדווח"). כניסה: `motion-pop-in` למסקוט ו-`motion-fade-up` (`--i` 1, 2, 3) לטקסט ולכפתור. שגיאה: אותו מבנה עם `Mascot.Oops` וכפתור `secondary` "נסה שוב".

### Login screen
רקע `bg-foam` + גרדיאנט הדף ורצועות גל `motion-drift` בתחתית. מרכז: `Mascot.Wave size={200}` עם `motion-float`; "surFriends" `text-display heading-tight text-gradient-sea`; שורת תיאור `text-body text-muted-text`; כפתור Google `lg` מלא רוחב (`bubble-primary` או `outline` לפי הנחיות מותג). `motion-fade-up` מדורג לכל הבלוקים.

## 11. מיפוי טוקנים קיימים (התאימות לאחור)

| קיים בקוד | ערך חדש | הערה |
|---|---|---|
| `bg-signature`, `bg-sunset`, `bg-primary` | `#1CC8DA` (טורקיז) | **טקסט עליהם `text-ink`**. אם ראית `text-white` על אלה: להחליף |
| `signature-hover/pressed/soft` | `#12B5C9` / `#0AA2B8` / `#DDF8FB` | |
| `text-orange-text`, `text-sunset-text`, `text-live-text` (live) | `#07707F` (orange-text, sunset-text), `#B83A0A` (live-text) | orange-text = טורקיז AA |
| `bg-live`, `bg-live` + `text-live-foreground` | `#FF6B57` אלמוג, ink | **ה-hero כבר לא `bg-signature`**: להשתמש ב-`bg-hero-sea` |
| `text-sea-deep`, `text-ink` | `#062B4A` | |
| `text-copy`, `text-shadow` | `#1F3F57` | |
| `text-muted-text`, `text-mist-text` | `#456479` | |
| `bg-surface`, `bg-sand`, `bg-muted` | `#E3F6F9` | |
| `bg-foam` | `#F4FDFF` | |
| `bg-background` | `#E3F6F9` + גרדיאנט `body` | |
| `text-link`, `text-link-blue`, `text-sea-wave-text` | `#0B6A8F` | |
| `border-input`, `border-mist-border` | `#4F8196` | |
| `bg-sea-wave` | `#1AA7D8` | דקורטיבי בלבד |
| `rounded-xl`, `rounded-card` | 24px | |
| `shadow-card/raised/fab/hero/nav/sheet` | גרסאות כחולות-ים | |
| `animate-live-pulse`, `animate-mascot-bob` | עכשיו אלמוג / `float` | |
| `text-meta` ב-`NewReportForm` | לא מוגדר | למחוק או להגדיר |

## 12. צ'קליסט לפיתוח (לסוכן ה-Frontend)
1. `text-ink` על `bg-signature`/`bubble-*` (ראשי); **`text-white` על `bg-hero-sea`**. מחפשים `text-ink` שנשאר בתוך ה-hero ומחליפים.
2. Hero: להחליף `bg-signature` ב-`bg-hero-sea`; "חי" ב-`bg-live`.
3. כרטיס: `glass-card rounded-card` או `bg-card shadow-card`.
4. כפתורים/צ'יפים: להשתמש ב-`Button` ו-`bubble-chip`; לא לבנות פיל ידנית.
5. טקסט טורקיז = `text-orange-text` בלבד. אקווה/טורקיז בהיר אף פעם לא כטקסט על בהיר.
6. אלמוג: רק נקודת/תג "חי" ובאדג' התראה.
7. רשימות: `motion-fade-up` + `style={{"--i": i}}`; עמוד: `motion-page` על `<main>`; מסקוט ב-hero/login: `motion-float`.
8. `wave-underline` מקסימום 1-2 כותרות. `text-gradient-sea` רק ב-≥22px.
9. RTL: אין `ml/mr`; המסקוט לא מתהפך; כפתור "דיווח" בשמאל.
