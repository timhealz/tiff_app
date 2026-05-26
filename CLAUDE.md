# The Tiff — Claude Code Project

## What We're Building

A web app for "The Tiff," an annual 3-day golf trip among a friend group now in its 7th year. Features live scoring, a real-time leaderboard, historical score tracking, and a proprietary handicap system derived from the group's own history.

## Tech Stack

- **Frontend**: React + Vite
- **Database + Auth**: Supabase (Postgres, magic link auth, real-time subscriptions)
- **Hosting**: Vercel (deploy from GitHub)
- **Auth**: Magic link only — no passwords

## Project Structure (target)

```
tiff_app/
├── CLAUDE.md                  ← you are here
├── docs/
│   ├── schema.sql             ← complete Supabase schema
│   ├── mockup.html            ← UI mockup (scorecard aesthetic, 5 screens)
│   └── decisions.md           ← design decisions and open questions
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── supabaseClient.js      ← Supabase client singleton
│   ├── components/
│   │   ├── Leaderboard/
│   │   ├── Scorecard/
│   │   ├── PlayerHistory/
│   │   ├── Commissioner/
│   │   └── Auth/
│   ├── hooks/
│   │   ├── useLeaderboard.js  ← real-time subscription
│   │   ├── useScorecard.js
│   │   └── useAuth.js
│   └── lib/
│       └── handicap.js        ← handicap calculation logic
├── index.html
├── vite.config.js
└── package.json
```

## Recommended Build Order

1. Supabase project setup — run schema.sql, configure magic link auth
2. Vite + React scaffold — install deps, set up Supabase client
3. Seed historical data — CSV import of past rounds
4. Auth flow — magic link login, session, role detection
5. Leaderboard — real-time, read-only, most visible feature
6. Score entry — foursome scorecard, scorekeeper flow
7. Player history — per-player record page
8. Commissioner dashboard — handicap review, override, lock

## Key Rules for Code Generation

- Never store calculated values in the database. Net scores, differentials, leaderboard positions are always derived via views or JS.
- The `handicap_snapshots` table is write-once after the commissioner locks. Never update it.
- Always use the Supabase client from `src/supabaseClient.js` — never instantiate it elsewhere.
- Real-time leaderboard subscribes to the `scores` table via Supabase Realtime.
- Score entry is always gross strokes only. Net is computed from the view.

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
