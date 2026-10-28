# surFriends — Design System (יום 3, חצי Visual)

> גרסה 1.0. מקור הטוקנים בקוד: `app/globals.css`. מסמך זה מגדיר מראה בלבד; מבנה, מצבים וזרימות ב-`docs/UX_SPEC.md`. שמות טוקנים באנגלית, והם שמות ה-utility של Tailwind v4 (`bg-sea-deep`, `text-mist-text`, `shadow-card`...).

## 1. כיוון עיצובי

"ים ועירוני, לא קלישאתי": מקום ישראלי-ים-תיכוני, לא חוף טרופי. בסיס חם של חול (`sand`) עם כרטיסים לבנים (`foam`), נייבי עמוק (`sea-deep`) כעוגן (TopBar, כפתור ראשי, כותרות), וצבע גל (`sea-wave`) רק כמילוי מבטא. כתום (`sunset`) שמור לדבר אחד: "חי עכשיו". אין דקלים, גלים מצוירים או גרדיאנטים דקורטיביים. קרוב ברוחו ל-Linear/Monzo בגרסה חמה: משטחים שטוחים, טיפוגרפיה חדה, הצללה עדינה בגוון נייבי, ניגודיות גבוהה לשמש.

- **Light only ל-v1.** מצב כהה לא נבנה: הפלטה מבוססת חול/קצף, ו-dark אמיתי דורש הגדרה מחדש של כל זוגות הניגודיות והאיורים. ה-`.dark` של ברירת המחדל של shadcn הוסר; `@custom-variant dark` נשאר מבוסס class כדי ש-`dark:` לא יופעל מהעדפת מערכת. `color-scheme: light` מוגדר.

## 2. צבעים

### 2.1 פלטת בסיס (8 ערכים מ-spec §9, ללא שינוי)

| Token | Hex | תפקיד |
|---|---|---|
| `sea-deep` | `#0A2540` | primary, TopBar, כותרות |
| `sea-wave` | `#0EA5E9` | accent: **מילוי בלבד** (FAB, מילוי דירוג, פס פעיל) |
| `sand` | `#F5EFE4` | רקע עמוד |
| `foam` | `#FFFFFF` | כרטיסים, sheets, BottomNav |
| `sunset` | `#F97316` | live / התראה: **מילוי בלבד** |
| `kelp` | `#166534` | הצלחה, תנאים טובים |
| `shadow` | `#1F2937` | טקסט ראשי |
| `mist` | `#94A3B8` | דקורטיבי בלבד (שלדים, מפרידים, disabled) |

### 2.2 וריאנטים נגישים (נוספו 4)

| Token | Hex | מחליף את | לשימוש |
|---|---|---|---|
| `sea-wave-text` | `#0369A1` | `sea-wave` | קישורים, טבעת פוקוס, טקסט/אייקון מודגש |
| `sunset-text` | `#C2410C` | `sunset` | טקסט "חי"/אזהרה על foam/sand |
| `mist-text` | `#475569` | `mist` | טקסט משני, placeholder, זמנים, תוויות |
| `mist-border` | `#64748B` | `mist` | גבול של שדות קלט ואייקונים לא פעילים |

בנוסף: `danger` = `#B91C1C` (טוקן סמנטי חדש, אין אדום ב-§9).

### 2.3 טוקנים סמנטיים (shadcn + surFriends)

| Token | ערך | הערה |
|---|---|---|
| `background` | `sand` | |
| `foreground` | `shadow` | |
| `card` / `popover` | `foam` | `*-foreground` = `shadow` |
| `primary` / `primary-foreground` | `sea-deep` / `foam` | hover: +12% לבן, pressed: +20% שחור |
| `secondary` | sea-deep 8% על sand | foreground `sea-deep` |
| `muted` | sea-deep 5% על sand | foreground = `mist-text` |
| `accent` | sea-wave 16% על foam | foreground `sea-deep`. מצב hover בלבד |
| `border` | sea-deep 14% על sand | מפרידים דקורטיביים בלבד |
| `input` | `mist-border` | גבול שדות (דורש 3:1) |
| `ring` | `sea-wave-text` | טבעת פוקוס |
| `live` / `live-foreground` | `sunset` / `sea-deep` | pill, נקודת "חי" |
| `live-text` | `sunset-text` | טקסט "חי" |
| `success` / `success-foreground` | `kelp` / `foam` | |
| `danger` = `destructive` | `#B91C1C` | `destructive-foreground` = `foam` |
| `link` | `#0369A1` | |

### 2.4 בדיקות ניגודיות WCAG (חושב לפי נוסחת הluminance היחסית של WCAG 2.x)

יעד: טקסט רגיל ≥ 4.5:1, טקסט גדול/אייקון/גבול UI ≥ 3:1.

| זוג (טקסט / רקע) | יחס | תוצאה |
|---|---|---|
| `shadow` / `foam` | 14.67 | AAA |
| `shadow` / `sand` | 12.82 | AAA |
| `sea-deep` / `foam` | 15.54 | AAA |
| `sea-deep` / `sand` | 13.57 | AAA |
| `foam` / `sea-deep` (כפתור ראשי, TopBar) | 15.54 | AAA |
| `sea-deep` / `muted` | 12.35 | AAA |
| `mist-text` / `foam` | 7.58 | AAA |
| `mist-text` / `sand` | 6.62 | AA |
| `mist-text` / `muted` | 6.03 | AA |
| **`mist` / `foam`** | **2.56** | **נכשל. לא לטקסט** |
| **`mist` / `sand`** | **2.24** | **נכשל. לא לטקסט** |
| `mist` / `sea-deep` (טקסט משני בתוך TopBar) | 6.06 | AA |
| **`sea-wave` / `foam`** | **2.77** | **נכשל. מילוי בלבד** |
| **`sea-wave` / `sand`** | **2.42** | **נכשל. מילוי בלבד** |
| `sea-wave-text` / `foam` | 5.93 | AA |
| `sea-wave-text` / `sand` | 5.18 | AA |
| `sea-deep` על מילוי `sea-wave` (FAB, כפתור accent) | 5.61 | AA |
| `sea-wave` / `sea-deep` (פעולה ב-toast) | 5.61 | AA |
| **`foam` על מילוי `sea-wave`** | **2.77** | **נכשל. אסור** |
| **`sunset` / `foam`** | **2.80** | **נכשל. מילוי בלבד** |
| **`sunset` / `sand`** | **2.45** | **נכשל. מילוי בלבד** |
| `sea-deep` על מילוי `sunset` (NewReportsPill) | 5.54 | AA |
| `sunset` / `sea-deep` (נקודת live ב-TopBar, לא טקסט) | 5.54 | עובר גם כטקסט |
| `sunset-text` / `foam` | 5.18 | AA |
| `sunset-text` / `sand` | 4.53 | AA (על הגבול. לא לגדלים מתחת ל-14px) |
| `kelp` / `foam` | 7.13 | AAA |
| `kelp` / `sand` | 6.23 | AA |
| `foam` על מילוי `kelp` | 7.13 | AAA |
| `danger` / `foam` | 6.47 | AA |
| `danger` / `sand` | 5.66 | AA |
| `foam` על מילוי `danger` | 6.47 | AA |
| טבעת פוקוס `sea-wave-text` מול foam / sand (non-text, 3:1) | 5.93 / 5.18 | עובר |
| גבול קלט `mist-border` מול foam / sand (non-text, 3:1) | 4.76 / 4.16 | עובר |

**כללי ברזל שנגזרים:** (1) `sea-wave` ו-`sunset` הם מילויים. טקסט עליהם הוא `sea-deep`, לעולם לא לבן. (2) טקסט בצבע גל/כתום משתמש ב-`*-text`. (3) `mist` המקורי לא מופיע כטקסט (תוקן ב-login וב-home: `text-mist` הפך ל-`text-mist-text`).

### 2.5 סקאלת WaveRating (1–5)

תמיד **מספר + צורה (5 נקודות) + תווית + צבע**. הצבע מחזק ולא נושא את המידע לבד. הצבעים הם גם צבעי הנקודות המלאות (non-text ≥ 3:1) וגם צבע הטקסט (≥ 4.5:1 על foam):

| דירוג | תווית | נקודות | צבע (טקסט + נקודה מלאה) | יחס על foam |
|---|---|---|---|---|
| 1 | שטוח | ●○○○○ | `mist-text` | 7.58 |
| 2 | חלש | ●●○○○ | `mist-text` | 7.58 |
| 3 | סביר | ●●●○○ | `sea-wave-text` | 5.93 |
| 4 | טוב | ●●●●○ | `kelp` | 7.13 |
| 5 | מעולה | ●●●●● | `kelp`, והתווית ב-pill מלא: bg `kelp`, טקסט `foam` | 7.13 |

נקודה ריקה: טבעת 1.5px ב-`mist-border`. 4 לעומת 5 נבדלים גם בספירת נקודות, במספר ובעובי/מילוי ה-pill, לא רק בגוון.

## 3. טיפוגרפיה

- **Rubik** (גופן ראשי, `font-sans`, subsets latin+hebrew, כבר נטען ב-`layout.tsx`). משקלים בשימוש: 400, 500, 600, 700 בלבד.
- **JetBrains Mono** (`font-mono`) רק לזמנים, מונים ונתונים (גובה גל, מחזור, N/5). תמיד `dir="ltr"` על מחרוזות נתונים מעורבות.
- בסיס 16px (קריאות בשמש). אין טקסט גוף מתחת ל-14px; `caption` (12) לתוויות/תגיות בלבד.

| Utility | גודל / שורה | משקל | שימוש |
|---|---|---|---|
| `text-display` | 28 / 34 | 700 | לוגו וכותרת login |
| `text-title` | 22 / 28 | 600 | כותרת מסך, כותרת EmptyState |
| `text-heading` | 18 / 24 | 600 | שם חוף בכרטיס, כותרת בלוק |
| `text-body` | 16 / 24 | 400 (500 לשם משתמש) | טקסט דיווח, שדות |
| `text-body-sm` | 14 / 20 | 400/500/600 | משני, כפתורים קטנים, צ'יפים |
| `text-caption` | 12 / 16 | 500 | תגיות, תוויות |
| `text-data` + `font-mono` | 13 / 18 | 500 | זמנים, נתוני תחזית |

כותרות: `text-sea-deep`. גוף: `text-foreground`. משני: `text-muted-foreground`. מספרים בעברית: `tabular-nums` במונים כדי שלא יקפצו.

## 4. ריווח ופריסה

- סקאלה: בסיס 4px של Tailwind (`1`=4 ... ). בשימוש: 4, 8, 12, 16, 20, 24, 32, 48.
- גוטר עמוד: `px-4` (16) בנייד, `px-6` מ-`md`. עמודת פיד: `max-w-feed` (576px) ממורכזת.
- ריווח בין כרטיסים: `gap-3` (12). padding כרטיס: `p-4`. בין בלוקים במסך: `gap-6`. בין שדות בטופס: `gap-4`.
- **יעד מגע:** `min-h-touch min-w-touch` (44px) לכל אלמנט אינטראקטיבי. רווח ≥ 8px בין יעדים סמוכים. אלמנט ויזואלי קטן מ-44 (כמו ✕ ב-chip) מקבל hit-area מורחב (padding או `after:-inset-2`).
- גבהים: `h-topbar` (56), `h-bottomnav` (64, + `pb-[env(safe-area-inset-bottom)]`). תוכן גולל עם `pb` שמכסה BottomNav + FAB.
- רדיוסים: `--radius` = 12px. `rounded-md` ≈ 9.6, `rounded-lg` = 12, `rounded-xl` ≈ 17, `rounded-full` לצ'יפים/FAB/אווטאר. כרטיס = `rounded-xl`, כפתור = `rounded-lg`, sheet = `rounded-t-2xl`.

### הצללות (גוון נייבי, לא שחור)

| Utility | שימוש |
|---|---|
| `shadow-card` | ReportCard במנוחה |
| `shadow-raised` | popover, תפריט, pill |
| `shadow-fab` | FAB |
| `shadow-sheet` | bottom sheet / dialog |

BottomNav ו-TopBar בלי צל: קו `border-border` בלבד.

## 5. אייקונים

`lucide-react` (כבר ב-shadcn, `iconLibrary: lucide`). קו 2px (ברירת מחדל), גדלים: **16** (`size-4`: בתוך צ'יפים/מטא), **20** (`size-5`: כפתורים, שורות, BottomNav), **24** (`size-6`: TopBar, FAB, EmptyState קטן). פער אייקון-טקסט: 4px (16) / 8px (20). אייקון בלי טקסט חייב `aria-label`; אייקון לצד טקסט `aria-hidden`. אייקונים שמסמלים מצב (שגיאה, "שולח", הצלחה) מופיעים תמיד עם טקסט.

אייקונים מומלצים: `Waves` (לוגו/ריק), `Plus` (FAB), `SlidersHorizontal` (סינון), `Star` (מועדף, מלא כשפעיל), `ArrowUp` (pill), `Clock` (שולח), `WifiOff`, `Check`, `CircleAlert`, `Ellipsis`, `Navigation` (כיוון גל).

## 6. RTL

- `dir="rtl"` כבר ב-root. **רק מאפיינים לוגיים:** `ms-/me-/ps-/pe-/start-/end-/border-s/border-e/rounded-s/rounded-e/text-start/text-end`. אסור `left/right/ml/mr/pl/pr/text-left/text-right`. כפתור ה-shadcn עודכן בהתאם (`ps/pe`).
- אייקונים כיווניים (חץ חזרה, chevron, `ArrowRight`...) מקבלים `rtl:-scale-x-100` (או `rtl:rotate-180`). **לא** הופכים: `Plus`, `Check`, `Star`, שעון, `ArrowUp`, מדיה/לוגו, ואייקון כיוון גל (הכיוון מחושב מנתוני מעלות).
- FAB: `end-4` ב-RTL נוחת בשמאל, כנדרש ב-UX_SPEC. מספרים, זמנים ונתוני תחזית: `dir="ltr"` או `<bdi>`. שמות חופים באנגלית: `<bdi>`.
- Shimmer מתהפך אוטומטית (`--shimmer-dir`). אנימציות הכנסה אנכיות בלבד, כך שלא תלויות בכיוון.

## 7. מפרטי רכיבים

כל הרכיבים: טקסט ≥ 4.5:1, פוקוס = `outline 2px var(--ring)` + offset 2px (גלובלי), יעד מגע ≥ 44px.

### Button (עודכן ב-`components/ui/button.tsx`)
גובה: default 44, lg 48, sm 40, xs 32 (xs רק עם hit-area מורחב), icon 44. טקסט `font-semibold`. וריאנטים: `default` (bg `primary`, fg `foam`), `accent` (חדש: bg `sea-wave`, fg `sea-deep`), `outline` (bg `card`, גבול `input`), `secondary`, `ghost`, `destructive` (מלא `danger`, fg `foam`), `link` (`link`). Hover: בהיר/כהה ב-12%. Press: `scale-[0.97]`, 120ms. Disabled: opacity .5. פוקוס: ring 2px + offset.

### TopBar
גובה `h-topbar`, bg `sea-deep`, טקסט/אייקונים `foam`, כותרת `text-heading` 600. לוגו "surFriends" `font-bold`. כפתורי אייקון: ghost על כהה (hover bg `foam/10`), 44x44. נקודת "מתחברים מחדש" `sunset`. בלי צל; פס תחתון לא נדרש.

### Chips (סינון פעיל, QuickTextChips, WaveHeightChips)
`h-touch` (44, ויזואלית 36 עם padding מורחב), `rounded-full`, `px-4`, `text-body-sm font-medium`. לא נבחר: bg `card`, גבול `input`, טקסט `foreground`. נבחר: bg `sea-deep`, טקסט `foam`, אייקון `Check` (לא צבע בלבד). chip סינון פעיל: bg `accent`, טקסט `sea-deep`, ✕ 44x44 hit-area, `aria-label`.

### WaveRating
**תצוגה:** שורה אחת `inline-flex items-center gap-2`: 5 נקודות 10px (`gap-1`), מספר `font-mono text-data font-semibold` ("4/5", `dir="ltr"`), תווית `text-body-sm font-medium`. צבעים לפי §2.5. דירוג 5: כל הקבוצה ב-pill `bg-kelp text-foam px-2.5 py-0.5 rounded-full`.
**קלט:** `radiogroup` של 5 כפתורי 52x52 (`min-w-touch`), `rounded-xl`, מספר 1-5 במרכז `text-heading font-semibold`, תווית קטנה מתחת. לא נבחר: bg `card`, גבול 1.5px `input`. נבחר: bg לפי הסקאלה (1-2 `mist-text`, 3 `sea-wave-text`, 4-5 `kelp`) + טקסט `foam` + `Check` קטן בפינה (`end-1 top-1`). כל הצבעים עם `foam` ≥ 5.9:1. מעבר בחירה: 120ms + `scale-95`→1.

### ReportCard
bg `card`, `rounded-xl`, `shadow-card`, `p-4`, `gap-3` אנכי, בלי גבול (על sand הצל מספיק). כותרת: אווטאר 40px (`rounded-full`, ראשי תיבות על `secondary` + `sea-deep` אם אין תמונה), שם `text-body font-medium text-sea-deep`, שורה שנייה: שם חוף (`text-body-sm font-medium text-link`, קו תחתון בפוקוס/hover) · זמן (`font-mono text-data text-muted-foreground`). אחר כך WaveRating, גובה משוער (`text-body-sm`, תווית "גובה:" ב-`muted-foreground`), טקסט `text-body` עד 4 שורות + "עוד" (`text-link`). תמונה: `aspect-[4/3] rounded-lg object-cover`, `bg-muted` בזמן טעינה. מצבי sending/failed: ראו §8.3. תפריט ⋯: icon-sm ghost.

### QuickReactionBar
שלושה כפתורי `h-touch rounded-full`: לא נבחר = outline; נבחר (`aria-pressed`) = bg `sea-deep`, `foam`, אייקון מלא (`Check`/אייקון מלא) ו-`font-semibold`. מונה `font-mono tabular-nums` בתוך הכפתור. "תגובה" = ghost עם `MessageCircle`.

### ReplyThread
שורת סיכום `text-body-sm text-muted-foreground` + chevron (מתהפך ב-RTL). פתוח: מפריד `border-border`, תגובות עם אווטאר 28px, שם `text-body-sm font-medium`, תג reaction: `rounded-full bg-accent text-sea-deep text-caption px-2`. composer: TextInput + כפתור "שלחו" `sm`.

### FAB
`size-14` (56), `rounded-full`, bg `sea-wave`, אייקון `Plus` 24px `sea-deep` (5.61), `shadow-fab`. מיקום: `fixed end-4 bottom-[calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom)+16px)]`. Hover: +12% לבן. Press: `scale-90`, 120ms. `aria-label="דיווח חדש"`. מוסתר ב-`/new`.

### BottomNav
`h-bottomnav`, bg `card`, `border-t border-border`, `pb-[env(safe-area-inset-bottom)]`. 3 פריטים שווים (flex-1), כל אחד עמודה: אייקון 24 + תווית `text-caption font-medium`, מינימום 44 רוחב/גובה. לא פעיל: `mist-text`. פעיל: `sea-deep`, אייקון מלא (fill), תווית `font-semibold`, פס עליון `h-[3px] w-8 rounded-full bg-sea-wave` (צורה + צבע, לא צבע לבד), `aria-current="page"`.

### NewReportsPill
`fixed top-[calc(var(--spacing-topbar)+8px)] start-1/2 -translate-x-1/2` (ב-RTL השתמשו ב-`inset-x-0 mx-auto w-fit`), `h-10 rounded-full px-4`, bg `live` (sunset), טקסט `sea-deep` `text-body-sm font-semibold` (5.54), `ArrowUp` 16px, `shadow-raised`. טקסט "3 דיווחים חדשים". כניסה: `animate-pill-in`; יציאה: `animate-pill-out`. מספר מתעדכן: `animate-count-pop`. `aria-live="polite"`.

### Skeletons
`class="skeleton"` על כל בלוק (הצורה של התוכן: עיגול 40px, שורות `h-4` ברוחבים 60%/90%, בלוק תמונה `aspect-[4/3]`). הכרטיס עצמו `bg-card shadow-card rounded-xl p-4`. Shimmer 1.4s linear; `prefers-reduced-motion`: סטטי. `aria-busy` על הרשימה.

### EmptyState
ממורכז, `gap-3`, `py-12 px-6`. איור קווי: SVG של 1-2 קווי גל, stroke 2px `sea-wave-text`, `fill: none`, ~96x64, עם קו רצפה `border`. בלי תמונות stock, בלי צבע מילוי. כותרת `text-title text-sea-deep`, הסבר `text-body text-muted-foreground`, CTA אחד `Button default lg`. שגיאה: אותו מבנה, איור קו ללא גל מלא (גל שבור), אייקון `CircleAlert` 24px ב-`danger` ליד הכותרת.

### InlineBanner / OfflineBanner
InlineBanner: bg `card`, `border-s-4` בצבע הסוג (`danger` / `kelp` / `sea-wave-text`), `rounded-lg p-3`, אייקון 20 + טקסט `text-body-sm text-foreground`, `role` לפי UX. OfflineBanner: מתחת ל-TopBar, bg `shadow` (#1F2937), טקסט `foam` (14.67), `WifiOff` 16px, `text-body-sm`, גובה 36.

### Toast (Sonner)
תחתית, מעל ה-BottomNav (`bottom: calc(var(--spacing-bottomnav)+env(safe-area-inset-bottom)+12px)`), `rounded-xl shadow-raised`, bg `sea-deep`, טקסט `foam text-body-sm`, אייקון משמאל לטקסט ב-RTL = בתחילת השורה (`Check`/`CircleAlert`). כפתור פעולה ("בטל") `text-sea-wave font-semibold` (5.61), hit 44. כניסה `animate-toast-in`, 4 שניות.

### Inputs (TextInput, Textarea, BeachPicker trigger, Switch)
שדה: `h-11` (Textarea `min-h-24`), bg `card`, גבול 1.5px `input`, `rounded-lg`, `px-3`, `text-body`, placeholder `muted-foreground`. פוקוס: גבול `ring` + outline גלובלי. שגיאה: גבול `danger`, מתחת `CircleAlert` 16 + טקסט `text-body-sm text-danger`. Disabled: bg `muted`, opacity .6. Switch: track כבוי `mist-border`, דולק `sea-deep`, thumb `foam`; גודל 44 גובה hit.

### Badge / SkillBadge / difficulty
`rounded-full px-2.5 py-0.5 text-caption font-medium`, bg `secondary`, טקסט `sea-deep`. תמיד טקסט.

### FavoriteToggle
icon button 44. כבוי: `Star` קו `foam` על TopBar. פעיל: `Star` **מלא** ב-`sea-wave`-fill עם קו `foam`. מעבר: scale 1→1.2→1 (`animate-count-pop`).

### Avatar
40 / 28 / 80px (פרופיל), `rounded-full`, בלי גבול; fallback ראשי תיבות `bg-secondary text-sea-deep font-semibold`.

### Sheet / Dialog (FilterSheet, BeachPicker, PushOptInSheet, מודאלי אישור)
bg `card`, `rounded-t-2xl` (sheet) / `rounded-2xl` (dialog), `shadow-sheet`, handle `h-1 w-10 rounded-full bg-mist` למעלה, overlay `sea-deep/50`. כפתורים בתחתית ברוחב מלא: ראשי + משני. מחיקה: כפתור `destructive`.

### ForecastSummary / WaveChart
ערכים ב-`font-mono text-data`, כותרות `text-body-sm text-muted-foreground`. גרף: קו `sea-wave-text` 2px, שטח `sea-wave` ב-15% opacity, "עכשיו" קו אנכי `sunset-text` מקווקו + תווית. כיוון: `Navigation` מסתובב + טקסט. צירים `mist-text`.

### RelativeTime
`<time>` ב-`font-mono text-data text-muted-foreground`. נקודת "חי" (דיווח מ-10 הדקות האחרונות): עיגול 8px `bg-live` עם `animate-live-pulse` + התווית "עכשיו"/"לפני X" (הטקסט נושא את המשמעות).

## 8. תנועה ומיקרו-אינטראקציות

### 8.1 טוקנים
| Token | ערך |
|---|---|
| `--dur-instant` | 80ms (הבהוב מצב) |
| `--dur-fast` | 120ms (hover, press, toggle) |
| `--dur-base` | 200ms (כניסת toast, שינוי צבע בולט) |
| `--dur-slow` | 320ms (כניסת כרטיס/sheet) |
| `ease-standard` | `cubic-bezier(.2,0,0,1)` |
| `ease-out-soft` | `cubic-bezier(.22,1,.36,1)` |
| `ease-press` | `cubic-bezier(.3,0,.2,1)` |

Utilities: `animate-card-in`, `animate-card-out`, `animate-pill-in`, `animate-pill-out`, `animate-count-pop`, `animate-live-pulse`, `animate-sending`, `animate-toast-in`, `animate-shimmer` (דרך `.skeleton`). שימוש ב-transition: `duration-(--dur-fast) ease-(--ease-press)`.

### 8.2 כללים
- אנימציות רק על `opacity` ו-`transform` (בלי layout shift).
- Hover רק על אלמנטים אינטראקטיביים. בלי parallax, בלי bounce דקורטיבי.
- **Button press:** `scale-[0.97]`, 120ms, + החשכת רקע 20%. FAB: `scale-90`.

### 8.3 Optimistic update
- **"אני בא"/"בדרך":** מצב נבחר מיידי (0ms): רקע הופך ל-`sea-deep`, `Check` נכנס, המונה מקבל `animate-count-pop` (220ms). בכשל: חזרה למצב קודם ב-120ms + toast "לא הצלחנו לשלוח. נסו שוב" (`CircleAlert`).
- **דיווח שנשלח:** הכרטיס נכנס בראש עם `animate-card-in` ו-`opacity-70` + `animate-sending`; בשורת המטא `Clock` 16 + "שולח..." (`text-muted-foreground`). הצלחה: opacity מתחלף ל-1 ב-`--dur-base` בלי הבהוב. כשל: opacity 1, `border-s-4 border-danger`, `CircleAlert` + "לא נשלח", כפתורי "נסו שוב" / "מחקו".
- **מועדף:** כוכב מתמלא + `animate-count-pop`; בכשל חוזר.
- **מחיקה (wait-for-server):** כרטיס `opacity-50`, בהצלחה `animate-card-out` ואז הסרה.

### 8.4 NewReportsPill
כניסה `animate-pill-in` (240ms, החלקה 8px מלמעלה + scale מ-.96). עדכון מספר: `animate-count-pop`. לחיצה: גלילה חלקה לראש והסתלקות `animate-pill-out` (160ms). כרטיס חדש כשהמשתמש בראש: `animate-card-in` (280ms).

### 8.5 prefers-reduced-motion
מוגדר גלובלית ב-`globals.css`: כל האנימציות/המעברים 0.01ms, shimmer ו-pulse ו-sending מבוטלים לגמרי (סטטי), `scroll-behavior: auto`. הפידבק נשאר דרך שינוי מצב מיידי (צבע/אייקון/טקסט), לא דרך תנועה.

## 9. מה השתנה בקוד
- `app/globals.css`: פלטה (8 + 4 וריאנטים נגישים + `danger`), מיפוי shadcn ל-sand/foam/sea-deep, טוקני טיפוגרפיה, `spacing-touch/topbar/bottomnav`, `container-feed`, הצללות, easing, keyframes ו-animations, `.skeleton`, פוקוס גלובלי, reduced-motion. הוסר `.dark`.
- `components/ui/button.tsx`: יעדי מגע 44px, padding לוגי (RTL), ring פוקוס, press, וריאנט `accent`, צבעי hover מהטוקנים.
- `lib/utils.ts`: `cn()` מורחב ב-`extendTailwindMerge` כך ש-`text-body`, `text-title` וכו' מזוהים כגודל גופן ולא כצבע (אחרת `tailwind-merge` מוחק `text-primary-foreground`).
- `login/page.tsx`, `(app)/page.tsx`: `text-mist` הוחלף ב-`text-mist-text` (תיקון AA).
