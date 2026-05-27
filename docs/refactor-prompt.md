# The Tiff — Information Architecture Refactor

## Context

The current app has three pages with overlapping responsibilities, creating duplicated data and components:
- **Home** and **History** both show the list of past tournaments
- **Players** and **History** both show all-time player standings
- It's unclear where new functionality (live tournament scoring, single-tournament drilldown) should live

The visual design is good. The data model is good. The information architecture is what needs fixing.

**Before writing any code, read these files to understand the current state:**
1. `src/App.jsx` (or wherever the router is defined) — understand current routes
2. All files in `src/pages/` — understand what each page currently renders
3. All files in `src/components/` — identify components that should become reusable
4. `docs/tiff-restructured.html` — the visual mockup for the new structure
5. `docs/tiff-multi-game.html` — the visual mockup for the live multi-game leaderboard (you'll reference this later but it's good context)

After reading, **report back what you found before making changes** — list the current routes, the current pages, and any obvious components that are already shared vs. duplicated. Then we'll discuss before you start the refactor.

---

## The conceptual problem

The current structure has pages organized around vague nouns ("History") instead of around what users want to do. The fix: each piece of data has **exactly one canonical page**. Every other appearance is a *preview* that links to the canonical page.

This rule resolves all the duplication automatically:

| Data | Canonical page | Appears elsewhere as |
|---|---|---|
| List of past tournaments | `/tournaments` | Home (3 most recent cards + "See all →") |
| Single tournament's results | `/tournaments/:year` | Linked from home, records, player profiles |
| List of all players | `/players` | Home roster strip ("The Field") |
| Single player's profile | `/players/:id` | Linked from everywhere |
| All-time records & standings | `/records` | Home (top 3 + "See full →") |
| Live leaderboard (active tournament) | `/tournaments/:year` (state-dependent) | Linked from home with prominent CTA |

**There is no `/history` route anymore.** That's the most important change. The word "history" is ambiguous — it could mean past tournaments or past players or past stats. By splitting it into `/tournaments` and `/records`, every piece of data has a clear home.

---

## New route structure

```
/                          → Home (mode-aware)
                             - Off-season: countdown + preview cards
                             - Tournament active: prominent CTA to current /tournaments/:year
                             - Post-tournament (within 7 days): celebration banner + link

/tournaments               → List of all tournaments (canonical)
/tournaments/:year         → Single tournament view (canonical)
                             - Active state: live leaderboard with multi-game tabs
                             - Complete state: final standings + champion banner + highlights
                             - Upcoming state: pairings + starting handicaps (TBD)

/players                   → Player directory (canonical)
/players/:id               → Player profile (canonical)

/records                   → All-time records + hall of fame (canonical)
                             - Only place cross-tournament aggregates live

/scorecard                 → Scorekeeper entry (tournament mode only)
/commissioner              → Admin dashboard (admin only)
/login                     → Magic link
```

**Routes to remove:** `/history` and any sub-routes. Their content gets split between `/tournaments` and `/records`.

---

## Bottom nav restructure

The bottom nav changes from the current structure to:

```
Home  |  Tournaments  |  Players  |  Records
🏠       🏆              👥           📊
```

During an active tournament, replace the Home tab with a "Live" tab that links directly to `/tournaments/:current-year`:

```
Live  |  Tournaments  |  Players  |  Records
⛳       🏆              👥           📊
```

This is a state-driven change — handled by checking if any tournament has `status = 'active'` in the database and conditionally rendering the nav.

---

## Component decomposition

The current duplication exists because page-level components fetch their own data and render their own UI. The refactor is to extract **shared presentation components** that pages compose together.

### Components to extract (or create if they don't exist)

**`<TournamentCard>`**
- Props: `tournament` (object), `variant` ("compact" | "full")
- Used on:
  - Home page horizontal scroll (compact variant)
  - `/tournaments` list page (full variant)
- Compact shows: year, location, champion name, net score
- Full shows: all of the above plus podium (2nd, 3rd) and "You finished Xth"

**`<TournamentList>`**
- Props: `tournaments` (array), `limit` (number, optional)
- Used on:
  - `/tournaments` page (no limit, shows all)
  - Home page (limit=3, with "See all →" link)
- Internally renders `<TournamentCard>` for each
- The "See all →" link is rendered by the parent, not the component itself

**`<PlayerRow>`**
- Props: `player` (object), `variant` ("avatar" | "list-row")
- Used on:
  - Home "The Field" horizontal scroll (avatar variant — circular avatar + name + HCP)
  - `/players` list (list-row variant — fuller info, larger tap target)
- Avatar variant has the gold border for reigning champion

**`<AllTimeStandings>`**
- Props: `standings` (array), `limit` (number, optional), `showHeader` (boolean)
- Used on:
  - `/records` page (no limit, full hall of fame)
  - Home page (limit=3, top 3 only)

**`<RecordsHighlights>`**
- Props: `records` (object), `count` (number, optional)
- Used on:
  - `/records` page (count=6 or all)
  - Home page (count=4)
- Each highlight: icon, label, value, detail (player + year)

**`<SectionHeader>`**
- Props: `title`, `subtitle` (optional), `seeAllLink` (optional path)
- Renders the section heading with the gold "See all →" link if provided
- Used at the top of every preview section on the home page

**`<TournamentHero>`**
- Props: `tournament` (object), `state` ("upcoming" | "active" | "complete")
- Used on `/tournaments/:year`
- Renders the green hero block at the top of the page with year, name, location, and a state badge (✓ Complete, 🔴 Live, etc.)

**`<ChampionBanner>`**
- Props: `champion` (object), `score`, `tournament`
- Used on `/tournaments/:year` for complete tournaments only
- The gold trophy banner showing the winner

**`<FinalStandings>`**
- Props: `standings` (array), `mode` ("final" | "live")
- Used on `/tournaments/:year`
- Final mode shows the static finishing positions
- Live mode shows "Thru X" indicators and updates in real-time

### Components that may already exist but should be audited

Whatever currently powers the home page tournament list and the history page tournament list should converge into `<TournamentList>` + `<TournamentCard>`. Same for any "all-time standings" tables across home, players, and history pages.

---

## Data layer changes

The home page should not fetch its own copies of tournament data. The pattern:

**Bad (current likely structure):**
```jsx
// HomePage.jsx fetches tournaments
// HistoryPage.jsx also fetches tournaments
// Two separate Supabase queries, two slightly different shapes
```

**Good (target structure):**
```jsx
// useTournaments() hook returns the canonical list
// Both HomePage and TournamentsPage call it
// HomePage uses { limit: 3 }, TournamentsPage uses no limit
// Single source of truth, single query
```

Create custom hooks for each data type:
- `useTournaments(opts)` → tournament list, with optional `limit`
- `useTournament(year)` → single tournament
- `usePlayers()` → all players
- `usePlayer(id)` → single player
- `useAllTimeStandings()` → derived from `v_leaderboard` across all tournaments
- `useRecords()` → derived from views, single-round bests etc.
- `useTournamentState()` → returns current active tournament or null; used for mode detection

These hooks become the **only** way data is fetched. Pages don't make Supabase queries directly anymore.

---

## Home page restructure (most visible change)

Current home page (best guess from mockups): countdown + roster + championships + records + all-time standings, all full-fidelity.

New home page is a **preview dashboard**. Every section is shorter than canonical, ends with "See all →", links to canonical page.

### New structure top to bottom:

1. **Countdown hero** (smaller than current — ~150px tall, not the full-screen treatment from earlier mockups)
   - "Next Tiff in: 312 days 14 hours 07 mins 22 secs"
   - Location, year
   - **If a tournament is currently active, this is replaced by a "Live Now" CTA banner** that links to `/tournaments/:year`

2. **"The Field" section**
   - SectionHeader: "The Field" / "All players →" (links to `/players`)
   - Horizontal scroll of player avatars (`<PlayerRow variant="avatar">`)
   - Shows ~5 players, scroll for more, or tap "All players →"

3. **"Recent Tournaments" section**
   - SectionHeader: "Recent Tournaments" / "All 7 years →" (links to `/tournaments`)
   - Horizontal scroll of `<TournamentCard variant="compact">`
   - Shows 3 most recent, then a "View all 7" card at the end of the scroll

4. **"All-Time Top 3" section**
   - SectionHeader: "All-Time Top 3" / "Full records →" (links to `/records`)
   - `<AllTimeStandings limit={3}>` — just the podium
   - Followed by an inline "See full hall of fame →" row

That's it. The home page is now ~400px tall instead of an endless scroll. It's a launching pad, not a destination.

---

## `/tournaments/:year` — the new flagship page

This is the most important new page because it's where the tournament experience lives — past, present, and future. **The URL doesn't change based on tournament state.** The same `/tournaments/2026` URL works:

- **Before the tournament:** Shows planned pairings, course list, starting handicaps. State badge: "Upcoming"
- **During the tournament:** Shows live leaderboard with multi-game tabs (Overall / Skins / 2v2 — see `docs/tiff-multi-game.html` for the full design of these tabs, which is the next phase of work). State badge: "🔴 Live"
- **Just after (within 7 days):** Shows celebration banner + final standings + highlights. State badge: "✓ Complete · Just finished"
- **Long after:** Shows final standings, champion, round-by-round grid. State badge: "✓ Complete"

The component structure for this page:

```jsx
<TournamentPage>
  <TournamentHero tournament={t} state={state} />
  {state === 'complete' && <ChampionBanner ... />}
  {state === 'active' && <MultiGameLeaderboard ... />}  // Future work
  {state === 'complete' && <FinalStandings mode="final" ... />}
  {state === 'complete' && <RoundByRoundGrid ... />}
  {state === 'complete' && completedRecently && <WeekHighlights ... />}
  {state === 'upcoming' && <Pairings ... />}
</TournamentPage>
```

For this refactor, focus on the **complete** state (replacing whatever is currently on the History page when you click into a year). The active state's multi-game leaderboard is a separate workstream.

---

## `/records` — the new canonical home for cross-tournament aggregates

Currently this content is split between History and Players. Consolidate.

Page structure:
1. **All-Time Records section** — `<RecordsHighlights count={6}>` showing low net round, low gross round, most championships, low differential, most birdies in an event, total eagles career
2. **Hall of Fame section** — `<AllTimeStandings>` with no limit, full table showing every player ranked by wins/podiums/avg net

---

## Refactor checklist (suggested order)

1. **Read the codebase first.** Report current routes, current pages, current shared components. Do not start changing files until I confirm.

2. **Add the new routes** (`/tournaments`, `/tournaments/:year`, `/records`) as stubs first. Don't delete `/history` yet.

3. **Extract shared components** one at a time, replacing inline implementations with the shared component. Verify each replacement doesn't break the current History page before moving on.

4. **Build the new `/tournaments` list page** using the extracted components.

5. **Build the new `/tournaments/:year` page** for the "complete" state. This is the most complex new page — handle one state at a time, starting with complete.

6. **Build the new `/records` page.**

7. **Refactor the home page** to use previews + "See all →" links instead of full-fidelity sections. The countdown hero stays but shrinks.

8. **Update the bottom nav** to the new four-tab structure (Home / Tournaments / Players / Records).

9. **Delete the `/history` route** and any orphaned components.

10. **Update any internal links** that pointed to `/history` to point to either `/tournaments` or `/records` based on intent.

---

## What not to do in this refactor

- **Don't build the multi-game live leaderboard yet** (Skins, 2v2). That's a separate phase. For now, the `/tournaments/:year` page for an active tournament can show a placeholder. The mockup in `docs/tiff-multi-game.html` is for future reference.
- **Don't change the visual design.** Same scorecard aesthetic, same colors, same fonts. This is purely an information architecture refactor.
- **Don't change the database schema.** Everything we need is already queryable from the existing tables and views.
- **Don't introduce new dependencies.** Use what's already in `package.json`.

---

## Success criteria

After the refactor:
- The word "history" does not appear in any route, file name, or nav label
- The home page is shorter and primarily linkout-driven
- Every piece of data on the home page can be found in full on a canonical page
- A new developer (or future me) can answer "where does X live?" instantly for any data type
- No two pages render the same data in full — only one canonical + previews elsewhere
- The component tree shows clear shared presentation components, not duplicated implementations

Start by reading the codebase and reporting back what you found.
