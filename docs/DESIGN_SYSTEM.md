# surFriends — Design System v2 ("Sunset")

> מחליף את v1 (הזמני). מקור הטוקנים בקוד: `app/globals.css`. מסמך זה מגדיר מראה בלבד; מבנה, מצבים וזרימות ב-`docs/UX_SPEC.md`. שמות טוקנים באנגלית והם שמות ה-utility של Tailwind v4 (`bg-signature`, `text-ink`, `shadow-card`...). Light only; dark mode מחוץ ל-scope.

## 1. כיוון עיצובי

משטחים לבנים נקיים, **צבע חתימה אחד** (כתום שקיעה) שמופיע רק בשלושה מקומות: כרטיס ה-hero, הפעולה הראשית (כפתור ראשי + כפתור "דיווח" בניווט) ופסי התקדמות. כל השאר רגוע: טקסט כהה חם, אפור לטקסט משני, צל רך מאוד. כותרות ב-Medium (לא Bold), מספרים גדולים עם יחידה קטנה, רדיוסים גדולים (19px), צ'יפים ולחצנים בצורת גלולה. מסקוט מאויר ("ימי") נותן הומור במסך הבית, במצבים ריקים ובהתחברות. השראה: מבנה ותחושה של אפליקציית Yellow, ללא הצבע הצהוב וללא העז; הזהות כאן כתומה-ימית.

כלל ברזל: **טקסט לבן על כתום נכשל AA (2.61:1)**. על כתום תמיד `text-ink`.

## 2. פלטת צבעים

### 2.1 תפקידים

| Token (Tailwind) | Hex | תפקיד |
|---|---|---|
| `signature` | `#FF7A1A` | hero, כפתור ראשי, FAB בניווט, פסי התקדמות, נקודת "חי". **רק fill.** |
| `signature-hover` | `#F56E0C` | hover |
| `signature-pressed` | `#EA630A` | active |
| `signature-soft` | `#FFF1E6` | רקע צ'יפ נבחר / שורה מודגשת |
| `orange-text` | `#C2410C` | כתום **כטקסט** על לבן/אפור (למשל "חי", ספירה) |
| `ink` | `#0A2540` | כותרות, מספרים גדולים, טקסט על כתום, אייקונים פעילים |
| `copy` | `#3A3A35` | טקסט גוף חם (ברירת מחדל של `body`) |
| `muted-text` | `#6B6B66` | טקסט משני, תוויות, זמנים |
| `surface` | `#F4F4F4` | רקע דף מאחורי כרטיסים, צ'יפים לא-פעילים |
| `foam` / `card` | `#FFFFFF` | כרטיסים, ניווט, מסכי login |
| `line` | `#E6E6E1` | קווי הפרדה דקורטיביים בלבד |
| `mist-border` / `input` | `#8A8A84` | מסגרת שדות וכפתורי outline (3:1 לרכיבי UI) |
| `link-blue` / `link` | `#007196` | קישורים, תג "חדש", focus ring |
| `link-soft` | `#E3F2F8` | רקע עדין סביב תוכן כחול / hover של ghost |
| `kelp` / `success` | `#0F7B5F` | הצלחה (ירוק-ים) |
| `danger` / `destructive` | `#C62828` | שגיאה |
| `sea-wave` | `#0EA5E9` | **דקורטיבי בלבד** (איורים, גרפים). לא פעולה ולא טקסט |
| `mist` | `#9A9A94` | דקורטיבי בלבד, לעולם לא טקסט |

אין יותר רקע בז'. `sand` נשאר כ-alias ל-`surface`.

### 2.2 טבלת ניגודיות (WCAG, מחושב)

| חזית על רקע | יחס | תוצאה | שימוש |
|---|---|---|---|
| `ink` על `signature` | 5.96:1 | AA | טקסט/אייקון על hero, כפתור ראשי, FAB |
| `ink` על `signature-hover` | 5.27:1 | AA | |
| `ink` על `signature-pressed` | 4.66:1 | AA | |
| **לבן** על `signature` | **2.61:1** | **נכשל** | אסור |
| `orange-text` על לבן | 5.17:1 | AA | טקסט כתום |
| `orange-text` על `surface` | 4.70:1 | AA | |
| `orange-text` על `signature-soft` | 4.67:1 | AA | |
| `ink` על לבן / `surface` | 15.5 / 14.1 | AAA | |
| `copy` על לבן / `surface` | 11.4 / 10.4 | AAA | |
| `muted-text` על לבן / `surface` | 5.36 / 4.87 | AA | |
| `link-blue` על לבן / `surface` | 5.53 / 5.03 | AA | |
| לבן על `link-blue` | 5.53:1 | AA | תג "חדש" |
| `kelp` על לבן / `surface` | 5.23 / 4.75 | AA | |
| לבן על `kelp` | 5.23:1 | AA | |
| `danger` על לבן / `surface` | 5.62 / 5.12 | AA | |
| לבן על `danger` | 5.62:1 | AA | |
| `mist-border` על לבן / `surface` | 3.47 / 3.16 | 3:1 UI | מסגרת שדה |
| `signature` על לבן (לא טקסט) | 2.61:1 | | מותר רק כשיש טקסט/מספר לצד (פס התקדמות עם מספר, כפתור עם תווית). לא לתקשר מידע בכתום בלבד |

## 3. טיפוגרפיה

Rubik (כבר נטען ב-`app/layout.tsx` כ-variable font, כל המשקלים זמינים). **משקלים במערכת: Light 300, Regular 400, Medium 500 בלבד.** המחלקות הקיימות `font-bold` ו-`font-semibold` מוגדרות ב-theme כ-500, כך שכותרות קיימות כבר Medium. בקוד חדש כתבו `font-medium`. JetBrains Mono נשאר רק ל-`text-data` (קואורדינטות/מספרים טכניים).

| Token | גודל / שורה | משקל | שימוש |
|---|---|---|---|
| `text-numeral-xl` | 64 / 1 | 300 | גובה גל ב-hero |
| `text-numeral-lg` | 44 / 1 | 300 | גובה גל בכרטיס דיווח / BeachCircle מורחב |
| `text-numeral-md` | 28 / 1 | 500 | דירוג inline |
| `text-unit` | 16 / 1 | 400 | היחידה/העשרוני הקטן ליד מספר |
| `text-display` | 28 / 34 | 500 | "ערב טוב יונתן," בהקשר hero |
| `text-title` | 22 / 28 | 500 | כותרות מסך |
| `text-heading` | 18 / 24 | 500 | כותרות כרטיס |
| `text-body` | 16 / 24 | 400 | גוף |
| `text-body-sm` | 14 / 20 | 400 (500 לכפתורים/תוויות) | משני |
| `text-caption` | 12 / 16 | 500 | תוויות ניווט, תגים |
| `text-data` | 13 / 18 | 500 mono | נתונים |

צבעי טקסט: כותרות ומספרים `text-ink`; גוף `text-copy` (ברירת מחדל מ-`body`); משני `text-muted-text` (שם קיים `text-mist-text`).

### BigNumber (סגנון המספר הגדול)
מספר שלם גדול ב-Light, היחידה/העשרוני קטנים ב-Regular, מיושרים ל-baseline. דוגמה: `1` `.2` `מ'`. משתמשים ב-utility `numeral` (ink, tabular-nums, `direction:ltr`, baseline, gap) כדי שהספרות והנקודה העשרונית לא יתהפכו ב-RTL.

```
<span class="numeral">
  <span class="text-numeral-lg font-light">1</span>
  <span class="text-unit">.2 מ'</span>
</span>
```
על hero כתום הצבע נשאר `ink`. אם אין ערך: "—" באותו גודל ב-`text-muted-text` (על hero: ink בשקיפות 60% אסורה; השתמשו ב-ink מלא).

## 4. ריווח ופריסה
סקאלת 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. רוחב טור פיד `max-w-feed` (576px). Gutter 16px במובייל, 24px מעל `sm`. ריפוד כרטיס 16px (מובייל) / 20px; hero 20px. מרווח בין כרטיסים 12px; בין סקציות 24px. יעדי מגע מינימום `min-h-touch` (44px). תוכן אחרון בדף מקבל padding תחתון של `bottomnav + 24px + safe-area` (הכפתור המורם בולט מעל הסרגל).

## 5. רדיוסים, צללים, מסגרות

| Token | ערך | שימוש |
|---|---|---|
| `rounded-card` / `rounded-xl` | 19px | כרטיסים, hero, sheets (הקיים `rounded-xl` ב-ReportCard כבר 19px) |
| `rounded-pill` / `rounded-full` | 9999px | צ'יפים, כפתורים, תגים, אריחים עגולים, FAB |
| `rounded-lg` | 12px | שדות קלט, תמונות בתוך כרטיס |
| `rounded-md` / `rounded-sm` | 9.6 / 7.2px | אלמנטים קטנים |

צללים (שחור ניטרלי, רכים מאוד): `shadow-card` = `0 5px 10px rgba(0,0,0,.08)`; `shadow-raised` = `0 0 15px rgba(0,0,0,.25)` (כפתור הניווט המורם; `shadow-fab` הוא alias); `shadow-hero` = glow כתום עדין; `shadow-nav` = קצה עליון של הסרגל; `shadow-sheet`. כרטיס לבן על `surface`: **בלי border**, רק `shadow-card`. מסגרת `border-line` רק לקווי הפרדה. שדות: `border-input`. Focus: outline 2px `link-blue` עם offset 2px (גלובלי) ו-`ring-offset-background`.

## 6. RTL
- `<html dir="rtl">`. להשתמש ב-logical properties בלבד: `ms-/me-/ps-/pe-`, `start-/end-`, `text-start`, `border-s`. אסור `ml/mr/left/right`.
- סדר DOM = סדר חזותי מימין לשמאל. הפריט הראשון ב-DOM מופיע **בימין**.
- מספרים: עטפו ב-`numeral` או `<bdi>`. שמות חופים/משתמשים בלטינית ב-`<bdi>`.
- אייקוני חץ/chevron מתהפכים (`rtl:-scale-x-100`); אייקונים לא-כיווניים (בית, משתמש) לא.
- המסקוט לא מתהפך. אל תשתמשו ב-`scale-x-[-1]` עליו.
- ה-shimmer כבר מתהפך דרך `--shimmer-dir`.

## 7. תנועה
`--dur-instant` 80ms, `--dur-fast` 120ms, `--dur-base` 200ms, `--dur-slow` 320ms; easing `--ease-standard`, `--ease-out-soft`, `--ease-press`. לחיצה על כפתורים: `active:scale-[0.97]` 120ms. כפתור הניווט המורם: scale 0.94 בלחיצה. כרטיס חדש: `animate-card-in`. המסקוט ב-hero/login: `animate-mascot-bob` (ריחוף 4px, 3.2s); במצב ריק: סטטי.
**Reduced motion**: כל האנימציות/המעברים מקוצרים ל-0.01ms, והלולאות (`skeleton`, `animate-shimmer`, `animate-live-pulse`, `animate-sending`, `animate-mascot-bob`) כבות לחלוטין. אין parallax. אין מידע שעובר באנימציה בלבד.

## 8. איקונוגרפיה
lucide-react, `strokeWidth` 2, גדלים 16 / 20 (`size-5`, ניווט) / 24 (בתוך אריחים עגולים), 28 בכפתור הניווט המורם. ליד טקסט: רווח 4-8px. אייקון בלבד חייב `aria-label` או `aria-hidden` עם תווית סמוכה. אייקונים בניווט: לא פעיל `muted-text` קו בלבד; פעיל `ink` עם מילוי `ink/10`.

## 9. המסקוט: "ימי" (Yami)

**כלב ים קטן ועגלגל**, גולש מושבע שלא מאבד אופטימיות. גוף בצבע ים-תכלת (`#38B6DC`), בטן לבנה, לחיים כתומות, מסגרת ink בעובי 4. מחזיק תמיד לוח גלישה כתום. **אישיות**: נלהב, קצת תלותי בגלים, דרמטי כשאין גלים ("הים שטוח, אני מת"), אף פעם לא מתנשא. הטון בטקסטים: חם, עם חיוך, בלי ציניות. הוא לא דומה לעז של Yellow בשום צורה (חיה ימית, צבעים אחרים, סילואטה עגולה).

קבצים: `components/mascot/` (`MascotWave.tsx`, `MascotWaiting.tsx`, `MascotOops.tsx`, `parts.tsx` משותף, `index.ts`). שימוש: `import { Mascot } from "@/components/mascot"` ואז `<Mascot.Wave size={140} />`. Props: `size` (px, ברירת מחדל 160, תוכנן ל-96-200), `className`. כל קומפוננטה `role="img"` עם `aria-label` בעברית, ללא JS לקוח (בטוחה ל-Server Components).

| פוזה | מתי | הבעה |
|---|---|---|
| `Mascot.Wave` | login, hero, onboarding | מנופף, עיניים שמחות, פה פתוח |
| `Mascot.Waiting` | מצבים ריקים ("אין דיווחים עדיין") | יושב על הלוח, מביט בים שטוח, שלוש נקודות המתנה |
| `Mascot.Oops` | שגיאה, offline | ידיים למעלה, טיפת זיעה, הלוח שבור |

כללי שימוש: על hero כתום הלוח (כתום) נבלע ברקע ונשאר קריא בזכות מסגרת ה-ink; ללא עטיפה מיוחדת. אל תצבעו אותו מחדש. אל תקטינו מתחת ל-96px (פרטי הפנים נעלמים). אל תשימו שני מסקוטים באותו מסך. מסקוט הוא דקורטיבי: ה-`aria-label` שלו לא מחליף את הטקסט של ההודעה; הכותרת וההסבר חייבים להופיע בטקסט.

## 10. רכיבים

### Greeting header (מחליף TopBar)
- רקע `surface` (בלי border, לא sticky כבד); גובה מינ' `topbar`; ריפוד 16px.
- שורה 1: "ערב טוב יונתן," ב-`text-title font-medium text-ink` (ברכה לפי שעה: בוקר טוב / צהריים טובים / ערב טוב / לילה טוב; שם פרטי). שורה 2 אופציונלית: `text-body-sm text-muted-text` ("הנה מה שקורה בחופים שלך").
- צד ה-end (שמאל): `UserAvatar` 40px עגול (`bg-secondary text-ink`, `font-medium`), הקשה פותחת פרופיל.
- אין שם אפליקציה בכותרת; לוגו רק ב-login.

### BottomNav + כפתור "דיווח" מורם
- סרגל: `bg-card`, `shadow-nav`, גובה `bottomnav` + safe-area, בלי `border-t`. פינות עליונות `rounded-t-card` (19px).
- 3 פריטים רגילים (פיד, פרופיל, הגדרות): אייקון 20 + תווית `text-caption font-medium` מתחתיו. פעיל: `text-ink` + אייקון מלא `ink/10` + נקודה כתומה 4px מתחת לתווית (לא רק צבע). לא פעיל: `text-muted-text`.
- **כפתור "דיווח"**: פריט נוסף **אחרון ב-DOM** כך שב-RTL הוא בצד ה-end (שמאל). עיגול 56px, `bg-signature text-ink`, אייקון `Plus` 28, `shadow-raised`, מורם כך שמרכזו על הקצה העליון של הסרגל (`-translate-y-1/2` יחסית לסרגל, או `-mt-7`). טבעת לבנה 4px סביבו (`ring-4 ring-card`) להפרדה. hover `signature-hover`, active `signature-pressed` + scale .94. תווית "דיווח" `text-caption font-medium text-ink` מתחת לעיגול, בתוך הסרגל. `aria-label="דיווח חדש"`, קישור ל-`/new`.
- ה-FAB הנפרד (`FAB.tsx`) מוסר. הסרגל נעלם ב-`/new` כמו היום.

### Hero summary card
- `bg-signature`, `rounded-card`, `shadow-hero`, ריפוד 20px, `overflow-hidden`, מינ' גובה 168px.
- צד ה-start (ימין): כותרת קטנה `text-body-sm font-medium text-ink` ("סיכום חי"), משפט ראשי `text-heading font-medium text-ink` ("3 דיווחים בשעתיים האחרונות"), ומתחת BigNumber (`text-numeral-xl`, ink) של גובה הגל הגבוה ביותר + `text-unit` "מ'", ושורת משנה `text-body-sm text-ink` (שם החוף).
- צד ה-end (שמאל): `<Mascot.Wave size={120}>` חותך קלות את הקצה התחתון (מותר לגלוש 8px).
- כפתור משני בתוך ה-hero: pill לבן `bg-card text-ink` ("לכל הדיווחים"), לא כפתור כתום על כתום.
- פס התקדמות (אם קיים): track `ink/15`, מילוי `ink` (על כתום לא נשתמש בכתום).
- בלי דיווחים: ה-hero הופך ל-EmptyState (ראו להלן), לא כרטיס כתום ריק.

### BeachCircle row
- שורה אופקית גוללת (`flex gap-4 overflow-x-auto`, `snap-x`, בלי scrollbar), ריפוד start/end 16px.
- אריח: עיגול 64px `bg-card shadow-card` עם אייקון 24 `ink` (או ראשי תיבות של החוף ב-`font-medium`), תווית מתחת `text-caption font-medium text-copy` שורה אחת עם `truncate`, רוחב 72px, ממורכז.
- תג **"חי"** כשיש דיווח טרי: pill 18px גובה, `bg-signature text-ink text-caption font-medium`, ממוקם בפינת ה-end העליונה של העיגול (חופף), עם נקודה `animate-live-pulse` מימינו. לא נסמך על צבע בלבד: המילה "חי". תג "חדש" (לתכונות חדשות): `bg-link-blue text-white`.
- אריח אחרון: "הוסף חוף" עיגול מקווקו `border-dashed border-input` עם `Plus`.
- Focus: outline גלובלי; מצב נבחר: טבעת 2px `ink` offset 2.

### ReportCard
- `bg-card rounded-card shadow-card`, בלי border, ריפוד 16px, על רקע `surface`.
- שורה עליונה: אווטר 36 + שם `text-body font-medium text-ink` + זמן יחסי `text-body-sm text-muted-text`; תג חוף כקישור `text-body-sm font-medium text-link`.
- גובה גל: `BigNumber` (`text-numeral-lg font-light`, יחידה "מ'") בצד ה-end, לצד `WaveRating`.
- גוף: `text-body text-copy`. תמונה: `rounded-lg`, יחס 4:3, מתחת לטקסט.
- דיווח חדש (≤15 דק'): תג "חי" קטן ליד השם (`signature` + ink). Skeleton: `skeleton` ברדיוס 19px.

### WaveRating
- תצוגה: 5 נקודות/גלים; מלאה = `signature`, ריקה = `surface` עם מסגרת `line`; ליד: מספר `text-data`/`numeral-md` (ink) וטקסט תיאור (`text-body-sm text-muted-text`) כדי שהמידע לא יהיה בצבע בלבד. (שימו לב: הצבע הקיים `text-sea-wave-text` כעת כחול `link-blue`; מומלץ להחליף ל-`text-ink` ולמלא ב-`signature`.)
- קלט (`WaveRatingInput`): כפתורי pill 44px; נבחר: `bg-signature text-ink border-signature` (אפשר להשאיר `bg-primary`); לא נבחר `bg-card border-input text-copy`. פוקוס גלובלי.

### BigNumber
קומפוננטה שמרנדרת `numeral` + שני spans (שלם, יחידה/עשרוני). Props: `value`, `unit`, `size` (`xl|lg|md`), `tone` (`ink`|`on-signature`; שניהם ink בפועל). `aria-label` מלא ("גובה גל 1.2 מטר") על העטיפה והחלקים `aria-hidden`.

### Chips
- Pill (`rounded-pill`), גובה 36 (יעד מגע 44 דרך ריפוד/margin), ריפוד 0 14px, `text-body-sm font-medium`.
- לא נבחר: `bg-card` על `surface` או `bg-surface` על לבן, `text-copy`, בלי מסגרת. נבחר: `bg-signature text-ink`. נבחר-שקט: `bg-signature-soft text-orange-text`.
- תג מידע: `text-caption font-medium`, גובה 20, `rounded-pill`, ריפוד 0 8px. "חדש": `bg-link-blue text-white`. "חי": `bg-signature text-ink`. הצלחה: `bg-success text-success-foreground`.

### Buttons (`components/ui/button.tsx`)
- כולם `rounded-pill`, `text-body-sm font-medium`, גובה 44 (default) / 36 (sm) / 52 (lg, CTA מלא רוחב).
- **default/primary**: `bg-signature text-ink`; hover `signature-hover`; active `signature-pressed`; disabled opacity .5.
- **secondary**: `bg-surface text-ink` (על כרטיס לבן) ; hover `bg-secondary`.
- **outline**: `bg-card border border-input text-ink`; hover `bg-accent`.
- **ghost**: שקוף `text-ink`; hover `bg-accent`.
- **link**: `text-link underline-offset-4 hover:underline`.
- **destructive**: `bg-danger text-white`.
- **action** (הווריאנט הישן `bg-sea-wave text-sea-deep`): להחליף ב-`bg-signature text-ink` או למחוק.
- מצב טעינה: ספינר `animate-spin` ב-ink, הטקסט נשאר.

### Inputs (קלט, BeachPicker, textarea)
- `bg-card`, `border border-input` (3.47:1), `rounded-lg` (12px), גובה 48, ריפוד 12px 14px, `text-body text-copy`, placeholder `text-muted-text`.
- Focus: `border-link-blue` + ring 3px `link-blue/30`. שגיאה: `border-danger`, טקסט עזר `text-body-sm text-danger` עם אייקון `AlertCircle` 16. Disabled: `bg-surface text-muted-text`.
- תווית מעל: `text-body-sm font-medium text-ink`, מרווח 6px. מרווח בין שדות 16px.

### PhotoField
אזור העלאה: `rounded-card border-2 border-dashed border-input bg-card`, אייקון `Camera` 24 + "הוסף תמונה" `text-body-sm font-medium text-ink`. תצוגה מקדימה `rounded-lg`. הצלחה `text-success`, שגיאה `text-danger`.

### OfflineBanner / PostedNotice / InAppBrowserNotice
- OfflineBanner: `bg-secondary text-ink`, מרכוז, אייקון `WifiOff` 16, בלי border; ניתן לצרף `Mascot.Oops size=96` רק בדף שגיאה מלא, לא בבאנר.
- PostedNotice (toast): `bg-success text-success-foreground rounded-pill`, ריפוד 10px 16px, `shadow-raised`, `animate-toast-in`.
- InAppBrowserNotice: כרטיס `bg-card rounded-card shadow-card`, כותרת ink Medium, טקסט `muted-text`.

### EmptyState (עם מסקוט)
ממורכז אנכית ואופקית: `Mascot.Waiting size={160}` (סטטי), כותרת `text-heading font-medium text-ink` ("הים שטוח כרגע"), הסבר `text-body-sm text-muted-text` עד 2 שורות, ו-CTA ראשי אופציונלי (pill כתום, "היה הראשון לדווח"). מרווחים: מסקוט→כותרת 16, כותרת→טקסט 4, טקסט→כפתור 20. גם ב-`ComingSoon`. מצב שגיאת רשת/טעינה: אותו מבנה עם `Mascot.Oops` וכפתור "נסה שוב" (outline).

### Login screen (עם מסקוט)
רקע `bg-foam` מלא. מרכז: `Mascot.Wave size={180}` עם `animate-mascot-bob`; מתחתיו "surFriends" ב-`text-display font-medium text-ink`, שורת תיאור "קהילת הגולשים של ישראל" `text-body text-muted-text`; כפתור Google `lg` מלא רוחב: `bg-signature text-ink` (או outline לבן עם לוגו Google אם נדרש לפי הנחיות מותג; בכל מקרה מסגרת `border-input`). הערת משפטית `text-caption text-muted-text`. שגיאה: כרטיס `border-danger` כמו היום + `text-danger`. אייקון העיגול הכתום הקיים בראש הדף מוחלף במסקוט.

## 11. מיפוי טוקנים קיימים (התאימות לאחור)

| קיים בקוד | ערך חדש | הערה |
|---|---|---|
| `text-sea-deep` | `#0A2540` (= `ink`) | אותו ערך; עדיף `text-ink` בקוד חדש |
| `text-mist-text` | `#6B6B66` | = `muted-text` |
| `text-shadow` | `#3A3A35` | טקסט גוף חם (= `copy`) |
| `text-link`, `text-sea-wave-text` | `#007196` | כחול קישור |
| `text-sunset-text`, `text-live-text` | `#C2410C` | = `orange-text` |
| `bg-sunset`, `bg-live` | `#FF7A1A` | = `signature` |
| `bg-sand` | `#F4F4F4` | alias deprecated |
| `bg-primary` / `text-primary-foreground` | כתום / ink | **השתנה מניווי לכתום**: כל מקום עם `bg-primary` נהיה כתום עם טקסט ink (login icon, צ'יפ/דירוג נבחר) |
| `bg-sea-wave` | `#0EA5E9` | **לא ערך פעולה יותר**: ב-`button.tsx` (action), `FAB.tsx`, `BottomNav.tsx` להחליף ל-`bg-signature` |
| `bg-success`/`text-success`, `text-danger`, `border-destructive` | `#0F7B5F` / `#C62828` | |
| `bg-background` | `#F4F4F4` | דפים עם כרטיסים; login: `bg-foam` |
| `shadow-card` / `shadow-fab` | חדש / alias ל-`shadow-raised` | |
| `font-bold`, `font-semibold` | 500 | alias ל-Medium |
| `rounded-xl` | 19px | כרטיסים |
| `text-meta` (ב-`NewReportForm`) | **לא מוגדר** | קיים בקוד אך אין לו טוקן (לא משפיע כיום); למחוק או להגדיר |

## 12. צ'קליסט לפיתוח
1. אין `text-white` על `bg-signature`/`bg-primary`. תמיד `text-ink`/`text-primary-foreground`.
2. טקסט כתום על לבן = `text-orange-text` בלבד, לא `text-signature`.
3. כרטיס = `bg-card rounded-card shadow-card`, בלי border.
4. כותרות Medium. אין `font-bold` חדש.
5. כתום מופיע לכל היותר ב-3 מקומות במסך (hero / פעולה ראשית / התקדמות).
6. המסקוט ≥96px, `role="img"` כבר מובנה, ובצד ה-end של ה-hero.
7. בדיקת RTL: כפתור "דיווח" משמאל, מספרים ב-`numeral`, אין `ml/mr`.
