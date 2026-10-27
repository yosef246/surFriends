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

# surFriends — Project Specification

> **Surf + Friends** — קהילת גולשים בזמן אמת לחופי ישראל.
> Spec מלא לצוות סוכנים (Design / Backend / Frontend / QA).

---

## 1. Vision & Goals

### Vision

אפליקציה שבה גולש בישראל יכול, בלחיצה אחת, לדעת:

1. **מי בים עכשיו?** — אילו גולשים כבר בחוף
2. **איך הגלים?** — דיווחים חיים + תחזית
3. **איך אני מצטרף?** — תגובה "אני בא" והתראה לקהילה

### Goals (לפורטפוליו)

- **מטרה ראשית:** פרויקט אמיתי לפורטפוליו שמוכיח יכולת end-to-end (Next.js 15, Supabase, Realtime, External API, Auth, Deploy)
- **מטרה משנית:** שימושי לחברים גולשים אמיתיים → feedback אמיתי
- **מה _לא_ מטרה:** monetization, scale ל-10K+ users, mobile native

### Success Criteria

- 10+ חברים משתמשים בפועל בחודש הראשון
- Lighthouse score > 90 בכל הקטגוריות
- Deploy חי שעובד בלי bugs ב-happy path
- README + screenshots שעובדים ב-GitHub

---

## 2. User Personas

### 🏄 Dani — הגולש היומיומי (Primary)

- גיל 25-40, גולש בתל אביב/חרבת, 2-3 פעמים בשבוע
- כאב: לא תמיד יודע אם חברים בים לפני שהוא נוסע
- Goal: רואה דיווחים חיים → יודע אם שווה לרדת → מצטרף לאחרים

### 🏖️ Noa — המתחילה (Secondary)

- גיל 20-30, לומדת לגלוש, לא מכירה הרבה גולשים
- כאב: מרגישה לבד בחוף, לא בטוחה אם המקום בטוח
- Goal: מוצאת גולשים אחרים, רואה שיש אנשים בחוף, מרגישה שייכות

### 🌊 Oren — הגולש המנוסה (Tertiary)

- גיל 35+, גולש 10+ שנים, מכיר הכל
- כאב: רוצה לשתף ידע ולעזור לאחרים
- Goal: מדווח על תנאים, מדרג גלים, בונה reputation בקהילה

---

## 3. User Stories

### MVP Stories

1. **As a surfer**, I want to sign in with Google so I can start using the app in 10 seconds.
2. **As a surfer**, I want to post a status update ("I'm at Beach X, waves are great") with a photo so others know what's happening.
3. **As a surfer**, I want to see a live feed of recent reports from all beaches, sorted by time.
4. **As a surfer**, I want to filter the feed by beach or city so I only see what's relevant to me.
5. **As a surfer**, I want to reply "I'm coming" to a report so others know I'll be there.
6. **As a surfer**, I want to see wave forecasts for a beach so I can plan ahead.
7. **As a surfer**, I want to get a push notification when a friend posts from my favorite beach.

### Future Stories (post-MVP)

8. As a surfer, I want to save my favorite beaches so they appear first.
9. As a surfer, I want to see my surf history (reports I posted) on my profile.
10. As a surfer, I want to carpool — "I have 2 seats from Haifa to Dor".
11. As a beginner, I want to filter instructors who are open to teaching.

---

## 4. Features

### 🎯 MVP (v1.0 — Must Have)

| #   | Feature                | Description                                                  |
| --- | ---------------------- | ------------------------------------------------------------ |
| F1  | **Auth**               | Google OAuth via Supabase Auth. Session persisted.           |
| F2  | **Live Feed**          | Chronological feed of all reports, auto-refreshing.          |
| F3  | **Post Report**        | Form: beach dropdown, text, image upload, wave rating (1-5). |
| F4  | **Reply to Report**    | Simple threaded replies ("I'm coming", "On my way").         |
| F5  | **Beach Filter**       | Dropdown to filter feed by beach or city.                    |
| F6  | **Wave Forecast**      | Fetch from Open-Meteo Marine, show for selected beach.       |
| F7  | **Push Notifications** | Web Push when favorite beach gets a new report.              |
| F8  | **User Profile**       | Name, avatar, skill level, favorite beaches.                 |

### 🚀 Future (v2.0+)

| #   | Feature                             | Priority |
| --- | ----------------------------------- | -------- |
| F9  | Map view with real-time surfer pins | Medium   |
| F10 | Carpool matching                    | Low      |
| F11 | Surf history + stats                | Medium   |
| F12 | Instructor finder                   | Low      |
| F13 | Hazard alerts (jellyfish, currents) | Medium   |
| F14 | Session planner ("tomorrow at 7")   | Medium   |

---

## 5. Technical Architecture

### Stack

| Layer | Technology | Why |
|-------|-----------|-----|| Framework | **Next.js 15 (App Router)** | SSR, Server Actions, file-based routing, Vercel-native || Language | **TypeScript** | Type safety, portfolio signal |
| Styling | **Tailwind CSS v4** | Fast, consistent, portfolio-standard |
| UI Kit | **shadcn/ui** | Beautiful, accessible, customizable |
| Backend | **Supabase** | Auth + Postgres + Storage + Realtime in one |
| ORM | **Supabase JS Client** | Direct, no Prisma overhead for this scale |
| Images | **Supabase Storage** | Integrated, cheap, CDN |
| Forecast | **Open-Meteo Marine API** | Free, no auth, Israel coast coverage |
| Push | **Web Push API** | Native browser, no Firebase needed |
| Deploy | **Vercel** | Free tier, Next.js-native, instant preview |
| Analytics | **Vercel Analytics** | Free, privacy-friendly |

### Data Flow (Post Report)

1. User fills form → client validates
2. Upload image → Supabase Storage → get URL
3. INSERT into `reports` table (Server Action)
4. Supabase Realtime broadcasts to all subscribed clients
5. All open feeds update automatically
6. Push notification sent to users with favorite_beach = this beach

---

## 6. Database Schema

​```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
display_name TEXT NOT NULL,
avatar_url TEXT,
skill_level TEXT CHECK (skill_level IN ('beginner','intermediate','advanced','pro')),
bio TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beaches (seed data: 12 Israeli surf spots — see surFriends-beaches-seed.sql)
CREATE TABLE beaches (
id SERIAL PRIMARY KEY,
name_he TEXT NOT NULL,
name_en TEXT NOT NULL,
city TEXT NOT NULL,
region TEXT NOT NULL,
latitude DOUBLE PRECISION NOT NULL,
longitude DOUBLE PRECISION NOT NULL,
description TEXT,
difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced'))
);

-- User's favorite beaches
CREATE TABLE user_favorites (
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
beach_id INT REFERENCES beaches(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
PRIMARY KEY (user_id, beach_id)
);

-- Reports (the heart of the app)
CREATE TABLE reports (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
beach_id INT REFERENCES beaches(id),
text TEXT NOT NULL CHECK (length(text) <= 500),
image_url TEXT,
wave_rating SMALLINT CHECK (wave_rating BETWEEN 1 AND 5),
wave_height_estimate TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_beach ON reports(beach_id, created_at DESC);

-- Replies to reports
CREATE TABLE replies (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
text TEXT NOT NULL CHECK (length(text) <= 200),
quick_reaction TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_replies_report ON replies(report_id, created_at);

-- Push subscriptions
CREATE TABLE push_subscriptions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
endpoint TEXT UNIQUE NOT NULL,
p256dh TEXT NOT NULL,
auth TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);CREATE POLICY "Anyone can read replies" ON replies FOR SELECT USING (true);

CREATE POLICY "Anyone can read reports" ON reports FOR SELECT USING (true);CREATE POLICY "Authenticated can reply" ON replies FOR INSERT WITH CHECK (auth.uid() = user_id);
​```

---

## 7. API & Server Actions

### Server Actions (Next.js)

​```typescript
// app/actions/reports.ts
createReport(formData): Promise<Report>
deleteReport(id: string): Promise<void>
replyToReport(reportId: string, text: string, reaction?: string): Promise<Reply>

// app/actions/profile.ts
updateProfile(data: ProfileUpdate): Promise<Profile>
toggleFavoriteBeach(beachId: number): Promise<void>

// app/actions/push.ts
subscribeToPush(subscription: PushSubscription): Promise<void>
​```

### API Routes

| Route                     | Method | Purpose                               |
| ------------------------- | ------ | ------------------------------------- |
| `/api/forecast/[beachId]` | GET    | Proxy to Open-Meteo (with cache)      |
| `/api/push/send`          | POST   | Internal: trigger push to subscribers |

### External: Open-Meteo Marine

​`
GET https://marine-api.open-meteo.com/v1/marine
  ?latitude={lat}
  &longitude={lng}
  &hourly=wave_height,wave_period,wave_direction
  &timezone=Asia/Jerusalem
​`

Cache 30 min on edge.

---

## 8. Component Tree (Next.js App Router)

​`
app/
├── (auth)/
│   ├── login/page.tsx
│   └── callback/route.ts
├── (app)/
│   ├── layout.tsx
│   ├── page.tsx                 — Home: Feed
│   ├── new/page.tsx             — New Report
│   ├── beach/[id]/page.tsx      — Beach detail + forecast
│   ├── profile/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── forecast/[beachId]/route.ts
│   └── push/send/route.ts
components/
├── ui/                          — shadcn components
├── feed/
│   ├── ReportCard.tsx
│   ├── ReportList.tsx
│   ├── ReplyThread.tsx
│   └── QuickReactionBar.tsx
├── forms/
│   ├── NewReportForm.tsx
│   └── BeachPicker.tsx
├── forecast/
│   ├── WaveChart.tsx
│   └── ForecastSummary.tsx
└── layout/
    ├── BottomNav.tsx
    └── TopBar.tsx
lib/
├── supabase/
├── openMeteo.ts
├── webPush.ts
└── beaches.ts
​`

---

## 9. Design System

### Vibe

**"ים ועירוני, לא קלישאתי"** — לא עוד אפליקציית גלישה טרופית עם לוגו של דקל. ישראלי, מודרני, צלול.

### Color Palette

​`
--sea-deep:      #0A2540   /* primary dark — Mediterranean deep */
--sea-wave:      #0EA5E9   /* primary accent — bright wave */
--sand:          #F5EFE4   /* background warm — Mediterranean sand */
--foam:          #FFFFFF   /* surfaces */
--sunset:        #F97316   /* alerts, "live" indicator */
--kelp:          #166534   /* success, good conditions */
--shadow:        #1F2937   /* text */
--mist:          #94A3B8   /* muted text */
​`

### Typography

- **Primary:** Rubik (עברית חזקה, גם לטינית) — Google Fonts
- **Mono:** JetBrains Mono (timestamps, data)
- Hebrew-first: `dir="rtl"` ברירת מחדל, English fallback

### UI Principles

1. **Mobile-first** — 90% יצפו בטלפון
2. **Instant feedback** — loading state + optimistic update
3. **Clear timestamps** — "לפני 5 דקות" כמו וואטסאפ
4. **High contrast** — חייב להיות קריא בשמש
5. **No clutter** — פיד נקי, קארד פשוט

### Key Screens

- **Login:** Logo + Google button + "קהילת הגולשים של ישראל"
- **Feed:** Top bar filter → infinite scroll of cards → FAB "+"
- **Report Card:** avatar + name + beach + timestamp + text + photo + rating + replies
- **New Report:** beach picker → text → photo → rating → submit
- **Beach Detail:** Forecast chart על למעלה, דיווחים אחרונים למטה

CREATE POLICY "Authenticated can post reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reports" ON reports FOR DELETE USING (auth.uid() = user_id);

---

## 10. External APIs

### Open-Meteo Marine

- **Base:** `https://marine-api.open-meteo.com/v1/marine`
- **No key needed**
- **Rate limit:** 10,000 req/day free
- **Data:** wave_height, wave_period, wave_direction, wind_wave_height
- **Strategy:** Cache per beach for 30 min on Vercel edge

### Google OAuth (via Supabase)

- Setup in Supabase dashboard
- Scopes: `email`, `profile`

---

## 11. Deployment & Environment

### Environments

- **Production:** Vercel + Supabase prod project
- **Preview:** Vercel preview deploys per PR
- **Local:** `supabase start` (local Docker)

### Env Variables

​`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_SITE_URL=https://surfriends.vercel.app
​`

### Secrets

Never commit. Use Vercel env vars + Supabase vault.

---

## 12. Timeline (14 days)

### Week 1 — Foundation

| Day | Owner      | Deliverable                                          |
| --- | ---------- | ---------------------------------------------------- |
| 1   | Backend    | Next.js init, Supabase project, Google OAuth working |
| 2   | Backend    | DB schema + seed 12 Israeli beaches + RLS policies   |
| 3   | Design     | Design system in Figma/code + 5 core wireframes      |
| 4   | Frontend   | Layout + BottomNav + login flow                      |
| 5   | Frontend   | Feed page + ReportCard component                     |
| 6   | Backend+FE | New Report form + image upload                       |
| 7   | Review     | Internal demo, fix bugs                              |

### Week 2 — Polish & Wow

| Day | Owner    | Deliverable                                          |
| --- | -------- | ---------------------------------------------------- |
| 8   | Backend  | Realtime subscription + optimistic updates           |
| 9   | Frontend | Reply thread + quick reactions                       |
| 10  | Backend  | Open-Meteo integration + cache                       |
| 11  | Frontend | Wave forecast chart (Recharts/Visx)                  |
| 12  | Backend  | Web Push setup + favorite beach notifications        |
| 13  | QA       | Lighthouse pass, mobile testing, bug sweep           |
| 14  | DevOps   | Vercel deploy + custom domain + README + screenshots |

---

## 13. Agent Task Breakdown

### 🎨 Design Agent

**Owns:** Visual language, UX flows, component designs

- [ ] Build design system (colors, typography, spacing) as Tailwind config
- [ ] Design 7 core screens (login, feed, new report, beach detail, profile, settings, empty state)
- [ ] Specify micro-interactions (loading, success, error states)
- [ ] Pick illustration/empty-state style (minimal line art, not stock photos)

### 🔧 Backend Agent

**Owns:** Supabase, data, APIs, auth, push

- [ ] Setup Supabase project + Google OAuth
- [ ] Write schema migration SQL
- [ ] Seed beaches table
- [ ] RLS policies
- [ ] Server Actions for all mutations
- [ ] Open-Meteo proxy route with caching
- [ ] Web Push setup + notification sender

### 💻 Frontend Agent

**Owns:** Next.js app, components, interactions

- [ ] Project scaffold (Next.js 15 + Tailwind + shadcn)
- [ ] Auth flow + middleware
- [ ] Layout + navigation (RTL-first)
- [ ] Feed with Realtime subscription
- [ ] Report form with image upload
- [ ] Beach detail + forecast chart
- [ ] Profile + settings
- [ ] Push subscription UI

### ✅ QA Agent

**Owns:** Testing, performance, polish

- [ ] Happy path manual tests for each user story
- [ ] Mobile responsive testing (iPhone/Android)
- [ ] Lighthouse CI → target 90+ all categories
- [ ] Accessibility (keyboard nav, screen reader, color contrast)
- [ ] Error boundary + friendly error states
- [ ] README + GIF demos for GitHub

---

## 14. Non-Goals (Explicit)

5. **Who's the "team lead" agent?** — האם זה סוכן ב-Claude Code שאני אמור להגדיר לו תפקיד?

---

_Spec version: 1.0 — ready for agent handoff._

To keep scope tight, we are **not** building:

- ❌ Native mobile apps (iOS/Android)
- ❌ In-app chat / DMs
- ❌ Payment / subscription
- ❌ Multi-language beyond Hebrew + English
- ❌ Real-time map with pins (future)
- ❌ Video uploads
- ❌ Comments on comments (one level of replies only)

---

## 15. Open Questions (for Yosef)

1. **Domain name** — buy `surfriends.com` or stick with `surfriends.vercel.app`?
2. **Logo** — DIY or hire a quick designer on Fiverr?
3. ~~**Beaches list**~~ ✅ **Done** — 12 חופים ב-`surFriends-beaches-seed.sql`4. **Hebrew/English toggle** — ברירת מחדל עברית, אבל האם להציע מתג?
