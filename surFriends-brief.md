# surFriends — Brief לראש הצוות

> **ל:** ראש צוות סוכנים
> **מ:** יוסף
> **קרא ראשון. פרטים מלאים ב-`surFriends-spec.md`.**

---

## TL;DR (30 שניות)

**מה בונים:** אפליקציית Next.js — פיד חי של גולשי ישראל. גולש מדווח מהחוף ("אני בבוגרשוב, גלים טובים") + תמונה + דירוג גלים. אחרים רואים בזמן אמת, עונים "אני בא", מגיעים.

**למה:** פורטפוליו ליוסף. גם שימושי לחברים גולשים בפועל.

**קהל:** חברים גולשים של יוסף (~10-50 יוזרים). לא לצרכי scale.

**Timeline:** 14 ימים.

---

## Stack החלטות (סופי, לא לדיון)

- Next.js 15 (App Router) + TypeScript
- Tailwind + shadcn/ui
- Supabase (Auth + Postgres + Storage + Realtime)
- Open-Meteo Marine API (חינם)
- Vercel deploy
- RTL / Hebrew-first

---

## MVP Features (8)

1. Google OAuth login
2. Feed חי של דיווחים
3. פרסום דיווח (חוף + טקסט + תמונה + דירוג 1-5)
4. תגובות + quick reactions ("אני בא" / "בדרך")
5. סינון פיד לפי חוף/אזור
6. תחזית Open-Meteo לחוף
7. Web Push לחוף מועדף
8. פרופיל יוזר

---

## Agents — מי עושה מה

### 🎨 Design Agent

Design system (colors, type, spacing) + 7 screens + micro-interactions.
Palette ראשוני ב-spec §9. ים-עירוני-ישראלי, לא קלישאה טרופית.

### 🔧 Backend Agent

Supabase setup + Google OAuth + schema SQL (ב-spec §6) + seed 12 חופים (`surFriends-beaches-seed.sql`) + RLS policies + Server Actions + Open-Meteo proxy + Web Push sender.

### 💻 Frontend Agent

Next.js scaffold + auth flow + layout RTL + Feed+Realtime + New Report form + Beach detail + forecast chart + profile + push subscription UI.

### ✅ QA Agent

Lighthouse 90+, mobile responsive, accessibility, error states, happy-path manual tests, README + GIFs.

---

## Timeline — 14 ימים (שבועיים)

**שבוע 1 — Foundation**

- Day 1-2: Backend — Next.js + Supabase + Google OAuth
- Day 3: Backend — Schema + seed + RLS
- Day 3: Design — design system + 5 wireframes (במקביל)
- Day 4-5: Frontend — Layout + Feed + ReportCard
- Day 6: Backend+FE — New Report form + image upload
- Day 7: Review + bug fixes

**שבוע 2 — Polish**

- Day 8: Realtime subscriptions
- Day 9: Replies + quick reactions
- Day 10: Open-Meteo integration
- Day 11: Wave forecast chart
- Day 12: Web Push
- Day 13: QA sweep
- Day 14: Deploy + README

---

## כללי משחק לסוכנים

1. **אל תחליף Stack** — ההחלטות סופיות. אם יש בעיה — שאל, אל תחליף.
2. **אל תוסיף פיצ'רים** מעבר ל-MVP. כל רעיון → `Future` list.
3. **ממושמעים ב-plan** — לפני כל קוד, verify עם ראש הצוות.
4. **Push קטן ותכוף** — PR לכל feature, לא monster PR.
5. **עברית raw text, לא i18n** — אין צורך במערכת תרגום לגרסה 1.

---

## שאלות פתוחות ליוסף (אם תעלה)

1. Domain — `surfriends.com` או רק `surfriends.vercel.app`?
2. Logo — DIY או מישהו ב-Fiverr?
3. Hebrew/English toggle — להציע או רק עברית?

---

**קבצים ב-workspace:**

- `surFriends-spec.md` — spec מלא 15 חלקים
- `surFriends-beaches-seed.sql` — 12 חופים מוכנים ל-INSERT
- `surFriends-brief.md` — זה. סקירה מהירה.

**התחל כאן, קרא spec לפרטים.**
