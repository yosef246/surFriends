# 🏄 surFriends

> Real-time surfing community for Israel. Know who's at which beach, right now.

**surFriends** connects Israeli surfers in real time. See who's at the water, how the waves are, and when to grab your board.

## ✨ Features

- 📍 **Live Feed** — See reports from surfers across Israel's coast
- 📸 **Visual Reports** — Photos + wave rating (1-5) + beach location
- 💬 **Quick Replies** — "I'm coming", "On my way", comment threads
- 🌊 **Wave Forecast** — Real-time marine forecasts via Open-Meteo
- 🔔 **Smart Notifications** — Push alerts for your favorite beaches
- 🇮🇱 **Hebrew-first** — RTL, built for Israel's surfing community

## 🚀 Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 15 (App Router) + TypeScript            |
| Styling      | Tailwind CSS + shadcn/ui                        |
| Backend      | Supabase (Auth + Postgres + Storage + Realtime) |
| Forecast API | Open-Meteo Marine (free)                        |
| Push         | Web Push API                                    |
| Deploy       | Vercel                                          |

## 🏖️ Beaches Covered

12 surf spots across Israel — from Nahariya in the north to Nitzanim in the south:

- **North:** Sokolov, Bat Galim, Zamir / Nirvana
- **Center:** Caesarea, Poleg, Ha-Sira, Hilton, Dolphinarium, Palmachim
- **South:** Keshatot / Gandhi, Delila, Nitzanim / Zikim

## 🏗️ Project Structure

​`
surFriends/
├── app/                  Next.js App Router
├── components/           UI components
├── lib/                  Supabase clients, APIs
├── public/               Static assets
└── supabase/             Migrations + seed
​`

## 🛠️ Development

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- Supabase CLI (for local dev)

### Setup

​```bash

# Clone

git clone https://github.com/<your-user>/surFriends.git
cd surFriends

# Install

pnpm install

# Env vars

cp .env.example .env.local

# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, VAPID keys

# Local Supabase

supabase start
supabase db reset # applies migrations + seed

# Dev server

pnpm dev
​```

Open http://localhost:3000

### Environment Variables

​`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_SITE_URL=
​`

## 🚢 Deployment

Deployed on Vercel. Preview deployments on every PR.

Push to `main` → production deploy.

## 📸 Screenshots

_Coming soon — see `/docs/screenshots/`_

## 🧭 Roadmap

- [x] MVP: Feed + Reports + Replies + Forecast
- [ ] Real-time map with surfer pins
- [ ] Carpool matching
- [ ] Surf history + stats
- [ ] Hazard alerts

## 📄 License

MIT — see [LICENSE](LICENSE)

## 👤 Author

**Yosef Palas** — Full-Stack Developer, Haifa, Israel

Built as a portfolio project to showcase modern Next.js + Supabase architecture.

---

_Catch a wave. 🏄_
