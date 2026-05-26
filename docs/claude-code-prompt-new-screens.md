Read docs/tiff-new-screens.html carefully before writing any code. This file contains three new screen designs — treat it as the visual spec for everything below.

---

We are adding three new screens to The Tiff app. All three follow the existing design system (cream background, dark green headers, gold rule lines, IBM Plex Mono for data, Bebas Neue for display). Reference the existing components and CSS variables already in the codebase.

## Screen 1 — Off-Season Landing (`/`)

This is the default home screen when no tournament has `status = 'active'`. It replaces whatever is currently rendering at `/` in off-season mode.

**Countdown hero**
- Large countdown to the next Tiff (days / hours / mins / secs)
- Pull the next tournament's date from the `tournaments` table where `status = 'upcoming'`
- If no upcoming tournament exists, show "Next Tiff — Date TBD"
- Location and year pulled from the same row

**The Field (player roster)**
- Horizontally scrollable row of player avatars (initials in a circle)
- Gold border on reigning champion (most recent tournament winner)
- Shows Tiff HCP below each avatar
- Tap any player → navigate to `/players/:id`

**Championships (year result cards)**
- Horizontally scrollable cards, one per past tournament
- Each card: year, location, champion name, net score vs par, 2nd and 3rd place
- Pull from `tournaments` joined to `v_leaderboard` for completed tournaments
- Most recent year first

**All-Time Records strip**
- 4 stat boxes in a 2×2 grid: Most Championships, Low Net Round, Low Gross Round, Low Differential
- Computed from `v_leaderboard` and `v_round_totals` across all completed tournaments

**All-Time Standings table**
- Columns: position, player, wins (W), podiums (Pod), avg net vs par (Avg)
- Sorted by wins desc, then podiums desc, then avg net asc
- Tap any row → `/players/:id`

**Bottom nav in this mode:** Home / Players / History / Me

---

## Screen 2 — Post-Tournament Wrap-Up (`/`)

This replaces the off-season landing when the most recent tournament has `status = 'complete'` AND `completed_at` is within the last 7 days. After 7 days it transitions to the off-season landing automatically.

**Champion hero**
- Floating trophy animation (CSS only, no JS animation libraries)
- Champion's name large, net score and tournament location below

**Final Standings**
- Same column structure as the live leaderboard: position, player + HCP chip, net total, +/− vs par, gross total
- All players, final positions, no "thru X" column

**Week Highlights**
- 2×2 grid of stat cards: Low Round, Most Birdies, Biggest HCP Drop, one more of your choice
- Pull from `v_round_totals` and `scores` for the completed tournament

**Tiff HCP Updates**
- Table showing every player's handicap before → after this tournament
- "Takes effect for [next year]" label
- Pull starting handicap from `handicap_snapshots`, compute new Tiff HCP from `v_tiff_handicap_by_year`
- Green for decreases, red for increases

**Share button**
- Uses the Web Share API (`navigator.share`) if available, falls back to copying a text summary to clipboard

**Bottom nav:** same as off-season (Home / Players / History / Me)

---

## Screen 3 — Player Directory (`/players`)

Accessible from both modes via the Players tab in the bottom nav.

**Search**
- Client-side filter on player name as you type — no server round-trip needed

**Sort tabs**
- All / Tiff HCP / Wins / Trips
- Default: All (sorted by wins desc, then trips desc)

**Player list**
- Each row: avatar (initials), name, trip count + champion indicator, Tiff HCP chip (t1/t2/t3 tier color), best finish, trips count
- Gold border on avatar for any past champion
- Tap any row → `/players/:id`
- Pull from `players` joined to `handicap_snapshots` (most recent) and `v_leaderboard` aggregated

**Bottom nav:** Home / Players (active) / History / Me

---

## Routing notes

- Mode detection already exists — use it. Off-season landing and post-tournament wrap-up both live at `/` and are conditionally rendered based on tournament state.
- `/players` is a new route — add it to the router.
- `/players/:id` already exists (player profile) — the directory just links to it.

---

## Data notes

- All data is read-only on these screens — no writes.
- All-time stats can be computed client-side after fetching from views rather than adding new DB views, unless the queries become unwieldy.
- The countdown timer should update every second using `setInterval` in a `useEffect`.

Build these three screens now. Use the mockup in docs/tiff-new-screens.html as the exact visual reference for layout, spacing, and component structure.
