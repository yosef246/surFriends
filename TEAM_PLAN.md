# TEAM_PLAN — surFriends

סטטוס: **רק שלב האפיון הושלם.** שאר הסוכנים לא יופעלו עד שהמשתמש יאשר את REQUIREMENTS.md ויענה על ה-Open Questions (בעיקר שאלה 1: פלטפורמה, ושאלה 2: עיר השקה). מזהי FR מפנים ל-REQUIREMENTS.md.

---

## project-architect — Phase 1
**Mission for this project:** לתכנן ארכיטקטורה קלה למפתח יחיד שמאפשרת דיווח בזמן אמת, Push אמין ותחזית מבוססת cache, בהתאם לפלטפורמה שהמשתמש יבחר.
**Must deliver:** ARCHITECTURE.md (stack, מודל נתונים, API, זרימת Push, אסטרטגיית cache לתחזית, מבנה תיקיות, אסטרטגיית פריסה), ובו החלטה מנומקת על PWA מול Expo לפי תשובת המשתמש.
**Must focus on:**
- Push ב-iOS וב-Android כולל מסלול התקנה ל-PWA (FR-36, FR-17).
- פרטיות מובנית: מיקום ברמת חוף בלבד, פקיעת נוכחות/דיווח, מחיקת חשבון (FR-30, FR-7, FR-9, FR-3).
- מנוע התראות עם סינון, rate limit ומניעת כפילויות (FR-18 עד FR-20).
- שכבת הפשטה לספק תחזית (Open-Meteo, אפשרות Stormglass) עם cache (FR-23, FR-25, FR-26).
- עלות תפעול נמוכה ופריסה פשוטה למפתח יחיד.
**Must NOT do:**
- לא לתכנן מיקרו-שירותים או תשתית ל-scale ארצי.
- לא לכלול DM, מפה חיה או תשלומים.
**Depends on:** BRIEF.md, REQUIREMENTS.md (כולל Open Questions והתשובות).

## ux-ui-designer — Phase 2
**Mission for this project:** לתכנן זרימות מובייל-ראשון שמאפשרות לגולש לראות את מצב החופים ולפרסם דיווח בפחות מ-15 שניות, בעברית RTL.
**Must deliver:** UX_SPEC.md (מפת מסכים, user flows, wireframes טקסטואליים, מצבי ריק/שגיאה/offline, מסך הנחיית התקנה ל-iOS, מסך בקשת הרשאת Push).
**Must focus on:**
- מסך בית: חוף, מצב גלים, זמן יחסי, מי נוכח (FR-6, FR-8).
- זרימת דיווח מהירה בהקשה מינימלית (FR-5, FR-9, FR-12).
- RSVP ושרשור תגובות ברורים (FR-13 עד FR-15).
- הבחנה ברורה בין תחזית אוטומטית לדיווח אנושי (FR-24), ומצב stale (FR-7).
- הגדרות פרטיות והתראות פשוטות, ו-onboarding קצר מ-2 דקות.
**Must NOT do:**
- לא לתכנן מסכי DM, שוק, יומן סשנים או מפת משתמשים.
- לא לבחור צבעים/פונטים (זה visual-designer).
**Depends on:** REQUIREMENTS.md, ARCHITECTURE.md.

## visual-designer — Phase 3
**Mission for this project:** לתת לאפליקציה זהות ימית קריאה בשמש חזקה, עם מערכת עיצוב RTL מותאמת לטלפון.
**Must deliver:** DESIGN_SYSTEM.md (צבעים, טיפוגרפיה עברית, רכיבים, אייקונים למצבי גלים, מצבי stale/פעיל), ונכסי לוגו/אייקון PWA לפי הצורך.
**Must focus on:**
- ניגודיות גבוהה ויעדי מגע גדולים לשימוש בחוץ.
- ארבעה מצבי גלים ברורים לפי צבע, אייקון וטקסט (נגישות, לא צבע בלבד).
- טיפוגרפיה עברית קריאה עם טקסט מעורב.
- אייקוני PWA ו-splash.
**Must NOT do:**
- לא לעצב פיצ'רי V2/Future.
- לא ליצור נכסים עם זכויות יוצרים של צד שלישי (תמונות מצלמות).
**Depends on:** UX_SPEC.md, REQUIREMENTS.md (סעיף 5).

## backend-developer — Phase 4
**Mission for this project:** לבנות שרת שמנהל משתמשים, חופים, דיווחים, RSVP והתראות Push, עם תחזית מ-Open-Meteo ופרטיות ברמת חוף.
**Must deliver:** קוד backend לפי ARCHITECTURE.md, seed של חופי עיר ההשקה, Push, ג'ובים לפקיעת נוכחות/דיווחים, endpoints למודרציה בסיסית, ובדיקות.
**Must focus on:**
- Auth, פרופיל, מחיקת חשבון (FR-1 עד FR-3).
- דיווחים, check-in, תגובות, RSVP (FR-5 עד FR-16).
- Push עם סינון, rate limit ושעות שקט (FR-17 עד FR-22).
- שילוב תחזית עם cache ו-fallback (FR-23, FR-25).
- report/block, rate limit, הסתרת תוכן, ללא שמירת GPS (FR-30 עד FR-35).
**Must NOT do:**
- לא לבנות DM, תשלומים או scraping של מצלמות.
- לא לאחסן מיקום מדויק.
**Depends on:** ARCHITECTURE.md, REQUIREMENTS.md.

## frontend-developer — Phase 5
**Mission for this project:** לממש את ה-PWA (או האפליקציה הנבחרת) בעברית RTL עם התקנה ו-Push שעובדים בפועל.
**Must deliver:** קוד frontend, service worker/manifest לפי הארכיטקטורה, מימוש כל מסכי ה-MUST, מסך התקנה ל-iOS, קישורי מצלמה.
**Must focus on:**
- RTL מלא וביצועי טעינה מתחת ל-2 שניות (סעיף 5).
- זרימת דיווח וה-RSVP מהירה (FR-5, FR-14).
- בקשת הרשאת Push בהקשר הנכון, והעדפות התראות (FR-18, FR-19, FR-36).
- תצוגת stale וזמן יחסי (FR-6, FR-7), ותחזית עם מקור (FR-23, FR-24).
- קריאה offline-tolerant בסיסית (FR-37).
**Must NOT do:**
- לא להטמיע מצלמות ללא הרשאה מתועדת (FR-28/29).
- לא לבנות פיצ'רי V2.
**Depends on:** UX_SPEC.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, ה-API של ה-backend.

## qa-tester — Phase 6
**Mission for this project:** לוודא שלולאת הליבה (דיווח, התראה, RSVP) עובדת במכשירים אמיתיים ושהפרטיות והסינונים נשמרים.
**Must deliver:** QA_REPORT.md (תוצאות מול קריטריוני ההצלחה, באגים לפי חומרה, מטריצת מכשירים).
**Must focus on:**
- Push ב-iPhone מותקן וב-Android, כולל סינון ואי-שליחה למפרסם (קריטריון 3).
- אימות פרטיות: אין GPS בבקשות או ב-DB (קריטריון 6).
- stale/פקיעה, rate limit וספאם.
- RTL וטקסט מעורב, נגישות בסיסית.
- זמני תגובה: דיווח ב-15 שניות, בית ב-2 שניות.
**Must NOT do:**
- לא לתקן קוד (זה bug-fixer).
- לא להרחיב בדיקות לפיצ'רים מחוץ לתחום.
**Depends on:** REQUIREMENTS.md (סעיף 7), הקוד המלא.

## bug-fixer — Phase 7
**Mission for this project:** לתקן את הבאגים מדוח ה-QA, בראש ובראשונה פרטיות, Push וכשלי לולאת הליבה.
**Must deliver:** תיקונים ממוקדים, ועדכון QA_REPORT.md עם סטטוס כל באג.
**Must focus on:**
- באגי חומרה גבוהה: פרטיות, התראות לא נשלחות/כפולות.
- RTL ותצוגת זמן.
- רגרסיות אחרי תיקון.
**Must NOT do:**
- לא להוסיף פיצ'רים או ל-refactor רחב.
**Depends on:** QA_REPORT.md.

## docs-writer — Phase 8
**Mission for this project:** לכתוב תיעוד שמאפשר למפתח ולמשתמשי קצה להפעיל, להתקין ולהבין את האפליקציה.
**Must deliver:** README.md (הרצה ופריסה), מדריך משתמש קצר בעברית (כולל התקנה ל-iOS והפעלת התראות), מדיניות פרטיות ותנאי שימוש בטיוטה (לא ייעוץ משפטי), מסמך מודרציה.
**Must focus on:**
- התקנה והפעלת Push ב-iOS.
- מה משותף ומה לא (פרטיות ברמת חוף).
- מדריך גיוס לעיר חדשה (cold start).
- הגדרת מפתחות/קונפיג וסף stale.
**Must NOT do:**
- לא לתעד פיצ'רים שלא נבנו.
- לא להציג מסמכים משפטיים כסופיים.
**Depends on:** כל התוצרים הקודמים.

## seo-aeo-engineer — Phase 9
**SKIP, או הפעלה מצומצמת בלבד.** האפליקציה היא PWA חברתי מאחורי התחברות, ללא תוכן ציבורי שנועד לאינדוקס. אם יוחלט על דף נחיתה ציבורי לגיוס (cold start), יופעל רק עבור דף זה: meta, Open Graph לשיתוף בוואטסאפ, ו-structured data בסיסי. אחרת לא להפעיל.

---

## Risk Map

| # | סיכון | בעלות / שלב | מענה |
|---|---|---|---|
| 1 | **פרטיות ושימוש לרעה במידע "מי איפה"** (חשיפת מיקום, הטרדה, ספאם והתעללות) | project-architect (Phase 1) ו-backend-developer (Phase 4); אימות ב-qa-tester | מיקום ברמת חוף בלבד, opt-in, פקיעה אוטומטית, report/block, rate limit, כלי מודרציה, בדיקות פרטיות. |
| 2 | **Cold start והתראות שמרעישות:** אפליקציה ריקה ואז נטישה, או ספאם שגורם לכיבוי Push | ux-ui-designer (Phase 2) ו-docs-writer (Phase 8); פילטרים אצל backend (Phase 4) | ערך עצמאי מהיום הראשון (תחזית), עיר אחת, פילטרים ו-rate limit, מדריך גיוס. |
| 3 | **תלות בפלטפורמה ובספקים:** Push ב-iOS PWA דורש התקנה, מצלמות ללא API, וזכויות מסחריות ב-Open-Meteo | project-architect (Phase 1) והמשתמש (Open Questions 1, 3, 4) | הנחיית התקנה, החלטה מבוססת נתונים על Expo, מצלמות כקישורים בלבד, וידוא תנאים מסחריים לפני השקה. |
