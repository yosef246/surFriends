# surFriends — Design System v4 ("Coast")

> מחליף את v3 (Sea). מקור הטוקנים בקוד: `app/globals.css`. המסמך מגדיר מראה בלבד; מבנה וזרימות ב-`docs/UX_SPEC.md`. שמות הטוקנים באנגלית = שמות ה-utility של Tailwind v4 (`bg-brand`, `text-ink` ...). Light הוא ברירת המחדל; ערכת dark מוגדרת בסעיף 2.5 כטוקנים בלבד (אין toggle, לא ממומש ב-CSS).

## 1. כיוון עיצובי

נקי, שטוח וממוקד תמונה, בהשראת אתרי תחזית ים ישראליים מודרניים: רקע עמוד תכלת-אפור בהיר, משטחים לבנים, כרטיסים עם קו דק ובלי צל, צבע מותג אחד חזק (כחול `#0f5fa8`) לפעולות, קישורים וניווט פעיל. כל מסך נפתח בתמונת חוף (hero) עם גרדיאנט כהה וכותרת לבנה ב-Suez One; המידע עצמו (תחזית, פיד, פרופיל) יושב על כרטיסים לבנים עם מספרים גדולים ומסמנים קטנים. הזהות שלנו נשמרת: wordmark "surFriends" ב-Suez One, הדמות "גל" (מינימלית, במצבי ריק/טעינה/הצלחה בלבד), ופלטה משלנו (כחול מותג + קורל כמטא). אין העתקה של מותג/לוגו/פונט/צבעים 1:1 מאתר כלשהו.

## 2. צבעים

### 2.1 מותג וניטרלים

| Token | Hex | תפקיד |
|---|---|---|
| `brand` (= `signature`, `primary`, `link`) | `#0f5fa8` | כפתור ראשי, קישורים, ניווט פעיל, טקסט מודגש |
| `brand-hover` | `#0b4f8f` | hover |
| `brand-pressed` | `#093f75` | pressed |
| `brand-bright` (= `turquoise`) | `#1b6fcf` | התחלת גרדיאנט, קווי גרף, אילוסטרציה (לא טקסט קטן) |
| `brand-soft` (= `signature-soft`) | `#e1eefa` | רקע נבחר, צ'יפ נבחר, בועת הודעה שלי |
| `page` (= `background`) | `#eef5fb` | רקע העמוד |
| `surface` | `#e8f0f8` | פאנלים רכים, toggle כבוי, שדה כבוי |
| card | `#ffffff` | כרטיסים, בועות, ברים |
| `card-line` / `line` / `border` | `#dbe7f2` | קו דק של כרטיס (דקורטיבי) |
| `mist-border` | `#6b819a` | גבול שדות וצ'יפים (3.9:1 על לבן, עומד ב-3:1 ל-non-text) |
| `ink` | `#0b1b2b` | כותרות, מספרים |
| `copy` | `#22384d` | טקסט גוף |
| `muted-text` | `#55687b` | טקסט משני |
| `coral` | `#ff6b57` | נקודת "חי", תגי התראה (מילוי בלבד) |
| `coral-text` (= `live-text`) | `#c2410c` | שורת מטא/eyebrow על רקע בהיר |
| `coral-on-photo` | `#ffa594` | שורת מטא על תמונה עם גרדיאנט |
| `abyss` | `#08131f` | בסיס overlay, רקע dark |

### 2.2 סטטוס

| Token | Hex | שימוש |
|---|---|---|
| `good-text` (= `success`, `kelp`) | `#0f7b5f` | "מים צלולים", מצב טוב |
| `warn-text` | `#b45309` | "חזקה", אזהרה (טקסט) |
| `warn-bg` / `warn-line` / `warn-ink` | `#fff4e0` / `#f0b35c` / `#6b3304` | כרטיס התראה (בז' + גבול כתום + טקסט חום) |
| `bad-text` (= `danger`, `destructive`) | `#c62828` | שגיאה, מחיקה |

### 2.3 צבעי שולח (בועות הצ'אט), כולם AA על לבן

`sender-1 #0f5fa8` (6.5), `sender-2 #b45309` (5.0), `sender-3 #0f7b5f` (5.2), `sender-4 #7c3aaf` (6.8), `sender-5 #b3265a` (6.3), `sender-6 #0e7490` (5.35). הצבע נבחר דטרמיניסטית: `hash(userId) % 6 + 1` ומוצב כ-`data-c`. אף פעם לא האות היחיד שמבדיל שולחים (השם תמיד כתוב).

### 2.4 טבלת ניגודיות (חושב: WCAG יחס luminance)

| טקסט / רקע | יחס | תוצאה |
|---|---|---|
| לבן על `brand` #0f5fa8 | 6.52 | AA (גם טקסט קטן) |
| לבן על `brand-hover` | 8.4 | AA |
| לבן על `brand-pressed` | 10.6 | AA |
| לבן על `brand-bright` #1b6fcf | 4.98 | AA (קצה: טקסט ≥14px/600) |
| לבן על `ocean-deep` #0a3d73 | 10.5 | AA |
| `ink` על לבן | 17.4 | AAA |
| `copy` על לבן / על page | 12.1 / 11.0 | AAA |
| `muted-text` על לבן / page / brand-soft | 5.75 / 5.23 / 5.0 | AA |
| `brand` על לבן / page / brand-soft | 6.52 / 5.9 / 5.5 | AA |
| `coral-text` על לבן / page | 5.18 / 4.7 | AA |
| `good-text` על לבן / page | 5.23 / 4.7 | AA |
| `warn-text` על לבן / page | 5.02 / 4.57 | AA |
| `warn-ink` על `warn-bg` | 9.5 | AAA |
| לבן על `#c62828` | 5.6 | AA |
| **`ink` על `brand`** | **2.7** | **נכשל. אסור**: על brand הטקסט תמיד לבן |
| לבן על תמונה | תלוי | רק מעל overlay (ראו PhotoHero: ≥ 4.5 על רוב התמונות, הגרדיאנט התחתון 0.78) |

### 2.5 Dark (אופציונלי, טוקנים בלבד)
`page #08131f`, card `#0f2236`, `card-line #1c3550`, `ink #eaf2fa`, `copy #c5d4e3`, `muted-text #93a8bd`, `brand #5aa7ee` (טקסט כהה `#08131f` עליו 7.4), `brand-soft #12304f`. לא לממש ללא החלטה נפרדת; ה-variant `dark:` נשאר class-based.

## 3. טיפוגרפיה

פונטים: **Suez One** (`font-display`) לכותרות hero ו-wordmark בלבד; **IBM Plex Sans Hebrew** (`font-sans`) לכל השאר, משקלים 400/500/600/700. מספרים: `tabular-nums`, `dir=ltr` עטוף ב-`bdi`/`numeral`.

| Role | Token | גודל / שורה / משקל | שימוש |
|---|---|---|---|
| hero | `text-hero` + `font-display` | 40/40 | כותרת על תמונה (לבן), עד 2 שורות, `text-wrap: balance` |
| display | `text-display` + `font-display` | 32/34 | כותרת עמוד שאין לו תמונה, שם בפרופיל |
| title | `text-title` | 26/32 / 700 | כותרת עמוד/כרטיס גדול |
| section | `text-section` (`section-title`) | 22/28 / 700 | כותרות סקשן |
| heading | `text-heading` | 18/24 / 700 | כותרת כרטיס, שם חוף בכרטיס |
| body | `text-body` | 16/24 / 400 | גוף |
| body-sm | `text-body-sm` | 14/20 / 400-600 | משני, כפתורים |
| label | `text-label` | 13/18 / 600 | תוויות, צ'יפים, שם שולח, תווית נתון |
| caption | `text-caption` | 12/16 / 500-700 | תגים, מטא, כיתוב |
| numeral + unit | `data-value` 28/28 / 700 + `data-unit` 13 / 600 | מספרי תחזית; hero numeral: `text-numeral-xl/lg/md` (קיימים) |

מטא/eyebrow: 12-13px, 600, קורל (`eyebrow` על בהיר, `eyebrow-light` על תמונה), למשל "חופי ישראל · עכשיו", "עודכנו לפני 27 דקות".

## 4. רדיוסים, גבולות, צל, ריווח, תנועה

- רדיוסים: card 16 (`rounded-card` / `rounded-xl`), tile 14 (`rounded-tile`), button/input 12 (`rounded-lg`), chip/badge pill (`rounded-pill`), בועה 16 עם פינת זנב 4.
- גבולות: card `1px #dbe7f2`; שדה/צ'יפ `1px mist-border`; כפתור משני `1px ink`.
- צל: כמעט אפס. `shadow-card` = 1px עדין; `shadow-raised` רק לתפריטים צפים; `shadow-sheet` ל-bottom sheet. אין glow, אין gloss.
- ריווח: סקאלת 4 (4,8,12,16,20,24,32,48); padding כרטיס 16 (גדול 20); רווח בין סקשנים 24-32; gutter דף 16; רוחב פיד `container-feed` 36rem.
- תנועה: עדין. מעברי צבע 140ms ease-out; כניסת כרטיס/בועה fade + slide-up 8-14px (`motion-fade-up`, stagger 40ms, מקסימום 8 פריטים); כפתור pressed `scale(.98)`; בלי spring/bounce/הגדלה ב-hover. `prefers-reduced-motion`: כל ה-animation כבויים והטרנספורמים של hover/active מבוטלים (בלוק קיים בסוף globals.css, כולל utilities חדשים). מצב טעינה: `skeleton` (shimmer).

## 5. מפרטי רכיבים

### a. PhotoHero
- מיכל: `hero-photo` (גובה מינ' 220px, `relative overflow-hidden`), `<Image fill priority sizes="100vw" className="object-cover">` ואחריו `<div class="photo-overlay"/>`. פינות: 0 למעלה (full-bleed), 16 למטה (`rounded-b-2xl`) אופציונלי.
- תוכן בתחתית-התחלה: שורת מטא `eyebrow eyebrow-light`, כותרת `font-display text-hero text-white` (+ `drop-shadow`), תת-כותרת `text-body-sm text-white/90`.
- כרטיסי פעולה (חיפוש/"לפי המיקום שלי") יכולים לחפוף את התחתית ב-`-mt-6`.
- credit: `<span class="credit">© שם צלם, CC</span>` בפינת הסוף-תחתון (לבן 10px, צל כהה).
- כשאין תמונה: נפילה ל-`bg-hero-sea`/`cover-brand` (גרדיאנט מותג), אותה פריסה.

### b. BeachPhotoTile
- `tile` ברוחב `w-40` (160) או `w-44` בסליידר (`flex gap-3 overflow-x-auto snap-x`, כל פריט `snap-start`), יחס 4:5. `<Image fill object-cover>` + `photo-overlay-tile`.
- תג pill בפינת ההתחלה-עליון: `tile-badge` — תוכן אחד בלבד לפי עדיפות: "חי" (עם נקודת קורל `size-1.5`), דירוג אחרון ("טוב"), או "N דיווחים". לבן עם טקסט ink.
- שם חוף: `tile-title` (700, 16px, לבן, צל טקסט) בתחתית-התחלה, עד 2 שורות. credit זעיר בסוף-תחתון אם קיים.
- מצבים: pressed `scale(.98)` (`motion-press`); focus outline 2px brand עם offset; ללא תמונה = גרדיאנט מותג + שם.
- מועדפים בפרופיל: אותו tile בגריד 2 עמודות או סליידר.

### c. StatusBubble (פריט פיד, בסגנון הודעת WhatsApp)
- שורה (RTL): `[אווטר 36-40px עגול]` בימין, אחריו הבועה. `flex items-start gap-2.5` (האווטר מיושר לראש הבועה, כי הזנב בפינה העליונה).
- בועה: class `bubble-msg`: לבנה, border `card-line`, radius 16 ופינה אחת (העליונה בצד האווטר) 4px, זנב משולש 10×12 ב-`::before` עם `inset-inline-start` (מצביע לאווטר; מתהפך אוטומטית ב-LTR/RTL).
- **ההודעות שלי**: `data-own="true"` — בצד ההפוך (שמאל ב-RTL), **בלי אווטר**, רקע `brand-soft`, הזנב ב-`inset-inline-end`. השורה: `justify-end` ב-DOM = `flex-row-reverse`/`ms-auto` לוגי. רוחב מקסימלי 85% מהשורה.
- תוכן לפי סדר: (1) שם שולח `bubble-sender data-c=1..6` (בהודעות שלי לא מוצג); (2) צ'יפ חוף `chip-link` (קישור, 28px); (3) טקסט `text-body copy`, `prose-he`; (4) תמונה אופציונלית `rounded-xl` (12) ברוחב מלא של הבועה, יחס מקס' 4:3, `mt-2`; (5) `wave-level` קומפקטי; (6) שורת footer: `bubble-time` "14:32 · לפני 12 דק'" בסוף-תחתון (float בתוך הבועה, כמו שעת WhatsApp).
- מתחת לבועה, מחוץ לה (`mt-1 ms-12`): שורת תגובות `text-label`: "🤙 3 באים · 🚗 1 בדרך" + כפתורי פעולה `ghost` קטנים (h-8), ו"💬 N תגובות" כקישור `brand`. 
- ריווח בין בועות: 8px (אותו שולח ברצף: 2px, ואווטר רק בבועה האחרונה של הרצף; אופציונלי).
- כניסה: `motion-fade-up`. אין scale ב-hover.

### d. WaveLevel
- `wave-level`: `level-bar` (5 פסים 14×4px, רווח 2px, פס מלא = `brand`, ריק = `#c9d9ea`) + מילת תווית (`text-label` 700, "טוב") + אופציונלי מספר/טווח "(0.8–1 מ')" ב-`muted-text`. גובה ≤20px.
- `data-level="1..5"`, `role="img"`, `aria-label="גובה גל: טוב (4 מתוך 5)"`. התווית המילולית חובה — לעולם לא צבע בלבד; הרמה מתבטאת גם במספר הפסים המלאים.
- גרסת 4 פסים (DataGrid): אותו רכיב עם 4 `<i>` ו-`data-level` 1..4.
- אין להשתמש בצבעי אזהרה על הפסים; מצב "חזקה" מתבטא במילה הצבועה `warn-text` לצידם.

### e. DataGrid cell ("מצב הים עכשיו")
- גריד 2 עמודות, `gap-3`. תא = `data-cell` (לבן, 16, קו דק, padding 14).
- שורה עליונה `data-label`: אייקון 16 + תווית muted ("גלים", "רוח", "מים", "אוויר"). אמצע: `data-value` 28 bold + `data-unit` ("0.8–1" "מ'", "27" "קמ״ש", "23" "°"). גלים: מתחת `level-bar` (4 פסים). תחתית: מילת סטטוס `text-label 700` — `warn-text` ("חזקה") / `good-text` ("מים צלולים מאוד") / `muted-text`.
- רוח: תג כיוון עגול 28px (`bg-brand-soft`, חץ `brand` 16 מסובב).

### f. Section header
`section-title` (22/28) בהתחלה; בסוף "הכל" כקישור `brand` `text-body-sm 600` עם חץ 16 (RTL: `chevron-left`). eyebrow קורל אופציונלי מעל. רווח אחרי: 12; לפני הסקשן: 24-32. ללא קו תחתון/גל דקורטיבי (אפשר `wave-underline` רק בכותרת hero בודדת).

### g. צ'יפים, כפתורים, שדות
- **Chip** (`chip-coast`/`bubble-chip`): pill 40px, לבן, גבול `mist-border`, אייקון 16 + תווית 13/600; נבחר: `brand-soft` + גבול ו-טקסט `brand`. תג מידע קטן: `chip-link` 28px.
- **Primary** (`variant=default|ocean|accent`): `brand` + לבן, 48px, radius 12, 600; hover `brand-hover`; pressed `brand-pressed` + scale .98; disabled opacity .5. **Key action** רוחב מלא: `className="btn-gradient w-full"` (גרדיאנט `#1b6fcf→#0f5fa8`, לבן).
- **Secondary** (`variant=secondary`): לבן + `1px ink`; hover `brand-soft`. `outline`: לבן + `1px mist-border`. `soft`: `brand-soft` + טקסט `brand-pressed`.
- **Ghost**: שקוף, טקסט ink, hover tint של brand 8%.
- **Danger** (`destructive`): `#c62828` + לבן.
- גדלים: default 48, lg 56, sm 40, xs 32; icon 48/40/32/56.
- **Input/Textarea**: לבן, `1px mist-border`, radius 12, גובה 48, padding 12/14, 16px (מונע zoom ב-iOS); placeholder `muted-text`; focus: גבול `brand` + outline 2px `brand` offset 2; error: גבול `danger` + טקסט עזר `danger` 13px עם אייקון; disabled: רקע `surface`, טקסט muted.

### h. BottomNav
לבן, `border-t` hairline (`bar-coast`), גובה 64 + safe-area. 4 פריטים שווים (בית, חופים, דיווח, פרופיל); "דיווח" הוא פריט רגיל עם אייקון `plus-circle`/`plus` 24 ב-`brand` (תמיד brand, גם לא פעיל). אין FAB מורם. פריט = `nav-item`: אייקון 24 + תווית 11/600; פעיל: צבע `brand`, תווית 700, ו-`aria-current="page"` (לא צבע בלבד: האייקון מלא/משקל stroke 2.5 כשפעיל). יעד מגע ≥ 44.

### i. Header
לבן, `border-b` hairline, גובה 56. התחלה (ימין ב-RTL): wordmark "surFriends" ב-Suez One 20px צבע `brand` (בלי מסגרת). סוף: אייקוני פעולה 24 בכפתורי ghost 44×44 (התראות, פרופיל, מועדפים). ללא glass/blur. על עמוד עם PhotoHero מותר header שקוף עם אייקונים לבנים מעל ה-overlay (variant), נהיה לבן אחרי גלילה.

### j. ProfileHero
- קאבר 112px: תמונת חוף מועדף עם `photo-overlay` או `cover-brand`. אווטר 80-88px עגול, `ring-4 ring-white`, חופף את הקאבר ב-`-mt-10`, מיושר להתחלה.
- שם: `font-display text-display ink`; שורת תת: שבב רמת גולש (`chip-link`) + תאריך הצטרפות muted.
- שורת סטטיסטיקה בכרטיס לבן: "X דיווחים · Y חופים מועדפים" — מספר `data-value` 22 + תווית `data-label`, מחולקים בקו דק אנכי.
- חופים מועדפים: סליידר `BeachPhotoTile`. פעולות: `secondary` "עריכת פרופיל".
- כרטיס "התחברו עם Google": `card-coast` ב-`brand-soft`/לבן עם גבול `brand` 1px, אייקון 40, כותרת 700, טקסט משני, כפתור `secondary` עם לוגו Google מלא רוחב.

### k. EmptyState
אייקון או הדמות "גל" קטנה (עד 96px, `motion-float` כבוי כברירת מחדל), כותרת `heading`, טקסט `body-sm muted`, כפתור primary אחד. במרכז, padding 32.

### l. Warning / alert card
`alert-coast`: רקע `warn-bg`, גבול `1px warn-line`, radius 16, אייקון אזהרה 20 ב-`warn-text`, כותרת 700 `warn-ink`, טקסט `warn-ink`. תמיד אייקון + מילה (לא צבע בלבד).

### מעטפת כללית
כרטיס = `card-coast` (או `glass-card`/`bubble-post`, ששמותיהם נשמרו). Skeleton = `skeleton`. Sheet/Dialog: לבן, radius 16 עליון, `shadow-sheet`, backdrop `abyss/50`.

## 6. אייקונים
lucide-react, stroke 2 (פעיל בניווט 2.5), גדלים 16 (בתוך צ'יפ/תווית), 20 (כפתור/שורת טקסט), 24 (ניווט/header). אייקון + טקסט: gap 4-6. חצים בכיוון RTL. אימוג'י (🤙 🚗 💬) מותרים רק בשורת התגובות.

## 7. מפת התאמה (v3 → v4) לשמירת תאימות
`signature`/`turquoise`/`orange-text`/`sunset` → `brand`; `aqua` → `#8fc2ee` (דקורטיבי); `bubble-primary|glass|soft|outline|ghost|danger|ocean|fab|chip` → סגנונות שטוחים (אותם שמות); `glass-card` → כרטיס לבן; `glass-bar` → בר לבן; `bg-hero-sea` → גרדיאנט מותג; `bubble-post` → כרטיס 16; `text-gradient-sea` → גרדיאנט כחול כהה; `eyebrow` → קורל; `motion-*` נשארו (ה-hover של `motion-bubble-hover` ללא scale); רקע העמוד שטוח `#eef5fb` (`--gradient-page: none`).
**שים לב**: טקסט ink על רקע `bg-signature` נכשל כעת (2.7:1). בכל מקום עם `bg-signature`/`bg-primary` הטקסט חייב להיות `text-white`. שימושים בקוד כיום: toggle ב-`NotificationsCard` (תקין אם הידית לבנה), נקודות ב-`WaveRating` (להחליף ל-`WaveLevel`).

## 8. Onboarding / splash scene (v4.1)
מסך ההרשמה הראשון משתמש בסצנה אחת משותפת עם ה-Splash (`components/shared/OceanScene.tsx`): 3 תמונות חוף ב-cross-fade איטי + Ken-Burns (`.ob-photo`), מעטה אוקיינוס כהה (`.ob-veil`, טקסט לבן AA), 10 בועות עולות (`.ob-bubble`), 3 שכבות גלים ב-parallax (`motion-drift` במהירויות/כיוונים שונים). כניסות: `.ob-mascot-pop`, `.ob-word` (חשיפת מילים, `--i`), `.ob-rise`, `.ob-card-in` (כרטיס חלבי white/85 + blur), `.ob-chip-pop`. שדה עם label צף וטבעת פוקוס (`.ob-field`, `.ob-label`), `.ob-shake` לשגיאה, כפתור `.ob-cta` (shimmer במנוחה, squish, `.ob-check`), ו-`.ob-wipe` (גל מלא-מסך ב-AppStart). רק transform/opacity. `prefers-reduced-motion`: כל אנימציות `.ob-*` כבויות, תמונה אחת סטטית, בלי בועות/shimmer/wipe.

## 9. מצב לילה (Night mode)
`NightScene` (ב-`components/shared/OceanScene.tsx`): שמיים כהים (`.night-sky`, מ-`abyss` ל-`ocean-deep`), ירח (`.night-moon`), 15 כוכבים מנצנצים (`.night-star`, opacity+scale), וגלי `OceanWaves night` איטיים (מהירות כפולה בערך) וכהים (`text-aqua/10..20`). גל ישן: `Mascot.Sleeping` (משקפיים על הראש, עיניים עצומות, אותיות Z מרחפות `.mascot-zzz`). מסך מלא: `components/night/NightScreen.tsx` (role=dialog, aria-modal). רק transform/opacity; `prefers-reduced-motion`: בלי נצנוץ, בלי Zzz מרחפות (נשארות סטטיות), בלי drift.
