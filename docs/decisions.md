# Design Decisions & Open Questions

## Tournament Format

- Net stroke play over 3 days
- Each day on a different course (3 courses per trip)
- Foursomes reshuffle each day — not fixed
- One scorekeeper per foursome enters gross scores for all 4 players
- Leaderboard = cumulative net score across completed rounds

## The Tiff Handicap System

Rather than trusting self-reported GHIN handicaps (which can be gamed), The Tiff computes its own handicap from the group's actual historical data.

### Formula
WHS-style: **best 8 of last 20 differentials × 0.96**
Differential = `(gross - course_rating) × 113 / slope`

### Three Tiers

| Tier | Criteria | UI Label |
|---|---|---|
| Tiff Established | 5+ rounds of history | `Tiff 13.2` (gold) |
| Tiff Provisional | 3–4 rounds | `Tiff* 8.4` (green) |
| Commissioner Assigned | <3 rounds or new player | `GHIN 22.0` or `Cmsr 18` (gray) |

### Handicap Timing

- **Starting handicap**: computed from all *prior years'* rounds only. Set and locked by commissioner before Day 1.
- **Live updates**: current tournament rounds fold into the differential pool and update the handicap for subsequent days.
- Commissioner can override any player's handicap before locking.
- `handicap_snapshots` is immutable after lock — permanent audit trail.

### Why This Matters

True story: a player with a 29 GHIN shot a 96 gross = net 67. Runaway winner. With Tiff Handicap derived from actual history, that number gets corrected to something honest.

## Scorekeeping Flow

- Groups are NOT pre-assigned in the app — they decide on the course
- Scorekeeper opens the app, taps "I'm keeping scores for my group"
- Selects which players are in their foursome from the full player list
- Enters gross scores hole-by-hole for all 4 players
- If two people try to keep scores for the same player, app warns them
- Commissioner can reassign scorekeeper if needed (phone dies etc.)

## Historical Data

- 7 years of trip history
- 3 players have attended all 7 years; most regulars have 4–5 trips
- Owner has all historical scores and will import via CSV seed
- Course rating + slope available for all historical rounds

## Decisions Made

| Question | Decision |
|---|---|
| Native iOS vs web app | Web app. Friends get a URL. |
| Push notifications | Not needed — leaderboard auto-refreshes when open |
| Fixed foursomes | No — reshuffled each day, scorekeeper self-selects |
| Store net scores in DB | No — always derived from gross + handicap via views |
| Handicap updates mid-tournament | Yes — each completed day feeds into subsequent days |
| Non-scorekeeper scorecard view | Read-only view of their group's in-progress card (TBD) |

## Open Questions

- **Handicap update aggressiveness**: Full WHS recalc after each day? Or weighted so current rounds count more heavily? Or capped at max X strokes movement per day?
- **Handicaps >18**: Does anyone carry >18? If so, they receive 2 shots on some holes — the schema handles this but needs testing.
- **Dispute flow**: Should non-scorekeepers have a "flag this hole" button to alert the commissioner?
- **Historical seed format**: What format is the historical data in? Spreadsheet columns will determine the import script.
