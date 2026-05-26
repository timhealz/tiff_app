-- ============================================================
-- THE TIFF — Supabase Schema
-- ============================================================
-- Design principles:
--   • Store raw data only (gross scores, handicap inputs)
--   • Derive everything else (net scores, differentials,
--     leaderboard positions) via views or app logic
--   • Every table has created_at for auditing
--   • RLS (Row Level Security) notes included
-- ============================================================


-- ── PLAYERS ──────────────────────────────────────────────────
-- One row per person, persists across all years.
-- email links to Supabase auth.users for magic link login.

create table players (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,          -- matches auth.users email
  name        text not null,                 -- display name e.g. "T. Healy"
  full_name   text,                          -- e.g. "Tim Healy"
  ghin        text,                          -- GHIN number, optional
  ghin_index  numeric(4,1),                  -- their current official handicap index
  is_admin    boolean default false,         -- commissioner flag
  created_at  timestamptz default now()
);

-- ── TOURNAMENTS ──────────────────────────────────────────────
-- One row per year's trip.

create table tournaments (
  id            uuid primary key default gen_random_uuid(),
  year          int unique not null,          -- e.g. 2025
  location      text not null,               -- e.g. "Pebble Beach"
  name          text,                         -- optional subtitle e.g. "The 7th Annual Tiff"
  status        text default 'upcoming'       -- upcoming | active | complete
                check (status in ('upcoming','active','complete')),
  handicaps_locked boolean default false,     -- commissioner locks before day 1
  created_at    timestamptz default now()
);

-- ── COURSES ──────────────────────────────────────────────────
-- Reusable across years. If you play Pebble twice, one row.

create table courses (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,              -- e.g. "Pebble Beach Golf Links"
  short_name     text,                       -- e.g. "Pebble Beach"
  location       text,
  par            int not null default 72,
  course_rating  numeric(4,1) not null,      -- e.g. 75.4
  slope          int not null,               -- e.g. 147
  created_at     timestamptz default now()
);

-- ── HOLES ────────────────────────────────────────────────────
-- 18 rows per course. Stroke index (SI) drives shots received.

create table holes (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  hole_number   int not null check (hole_number between 1 and 18),
  par           int not null check (par between 3 and 5),
  stroke_index  int not null check (stroke_index between 1 and 18),  -- 1=hardest
  yards         int,
  unique (course_id, hole_number)
);

-- ── TOURNAMENT ROUNDS ────────────────────────────────────────
-- One row per day of the tournament.
-- Links a tournament day to a specific course.

create table tournament_rounds (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid not null references tournaments(id) on delete cascade,
  course_id      uuid not null references courses(id),
  day_number     int not null check (day_number between 1 and 3),
  round_date     date,
  unique (tournament_id, day_number)
);

-- ── FOURSOMES ────────────────────────────────────────────────
-- Groupings per round. Reshuffled each day.
-- scorekeeper_id is the player entering scores for the group.

create table foursomes (
  id                  uuid primary key default gen_random_uuid(),
  tournament_round_id uuid not null references tournament_rounds(id) on delete cascade,
  scorekeeper_id      uuid references players(id),   -- nullable until assigned on course
  tee_time            time,                           -- optional
  created_at          timestamptz default now()
);

-- ── FOURSOME PLAYERS ─────────────────────────────────────────
-- Junction table: which players are in which foursome.

create table foursome_players (
  foursome_id  uuid not null references foursomes(id) on delete cascade,
  player_id    uuid not null references players(id),
  primary key (foursome_id, player_id)
);

-- ── HANDICAP SNAPSHOTS ───────────────────────────────────────
-- The official handicap used for each player in each tournament.
-- Locked by commissioner before day 1. Never changes after lock.
-- This is the historical record — don't update, only insert.

create table handicap_snapshots (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references tournaments(id) on delete cascade,
  player_id       uuid not null references players(id),

  -- The final number actually used
  playing_handicap  numeric(4,1) not null,

  -- How it was derived
  method          text not null
                  check (method in (
                    'tiff_established',   -- 5+ rounds, full calc
                    'tiff_provisional',   -- 3-4 rounds, partial calc
                    'ghin',               -- fell back to GHIN index
                    'commissioner'        -- manually set
                  )),

  -- Source values for auditability
  tiff_calculated   numeric(4,1),    -- what the Tiff formula produced (null if no history)
  ghin_at_time      numeric(4,1),    -- their GHIN index at time of snapshot
  rounds_used       int,             -- how many Tiff rounds went into the calc
  commissioner_note text,            -- optional note explaining any override

  locked_at       timestamptz,       -- when commissioner hit lock
  created_at      timestamptz default now(),

  unique (tournament_id, player_id)
);

-- ── PLAYER ROUNDS ────────────────────────────────────────────
-- One row per player per day. Status tracks entry progress.

create table player_rounds (
  id                    uuid primary key default gen_random_uuid(),
  tournament_round_id   uuid not null references tournament_rounds(id) on delete cascade,
  player_id             uuid not null references players(id),
  foursome_id           uuid references foursomes(id),

  status  text default 'not_started'
          check (status in ('not_started','in_progress','complete','withdrawn')),

  -- Submitted timestamp for audit trail
  submitted_at  timestamptz,
  created_at    timestamptz default now(),

  unique (tournament_round_id, player_id)
);

-- ── SCORES ───────────────────────────────────────────────────
-- One row per player per hole per round.
-- Store gross only. Net is derived.

create table scores (
  id               uuid primary key default gen_random_uuid(),
  player_round_id  uuid not null references player_rounds(id) on delete cascade,
  hole_id          uuid not null references holes(id),
  gross_strokes    int not null check (gross_strokes between 1 and 15),
  entered_by       uuid references players(id),  -- scorekeeper who entered it
  entered_at       timestamptz default now(),
  updated_at       timestamptz default now(),

  unique (player_round_id, hole_id)
);


-- ============================================================
-- VIEWS — Derived calculations live here, not in base tables
-- ============================================================

-- ── V: HOLE SCORES WITH CONTEXT ──────────────────────────────
-- Joins scores to holes, computes net strokes per hole.
-- shots_received = floor(playing_handicap * stroke_index / 18)
-- simplified: player gets a shot on each hole where SI <= handicap

create or replace view v_hole_scores as
select
  s.id,
  s.player_round_id,
  s.gross_strokes,
  h.hole_number,
  h.par,
  h.stroke_index,
  pr.player_id,
  tr.tournament_id,
  tr.course_id,
  tr.day_number,
  hs.playing_handicap,

  -- Shots received on this hole
  -- A handicap 13 player gets a shot on SI 1-13 holes
  case when h.stroke_index <= floor(hs.playing_handicap) then 1
       when h.stroke_index <= mod(hs.playing_handicap::int, 18)
            and hs.playing_handicap > 18 then 2
       else 0
  end as shots_received,

  -- Net strokes on this hole
  s.gross_strokes - (
    case when h.stroke_index <= floor(hs.playing_handicap) then 1
         when h.stroke_index <= mod(hs.playing_handicap::int, 18)
              and hs.playing_handicap > 18 then 2
         else 0
    end
  ) as net_strokes,

  -- Score label relative to par
  case
    when s.gross_strokes <= h.par - 2 then 'eagle'
    when s.gross_strokes  = h.par - 1 then 'birdie'
    when s.gross_strokes  = h.par     then 'par'
    when s.gross_strokes  = h.par + 1 then 'bogey'
    else 'double_plus'
  end as score_label

from scores s
join holes h               on h.id = s.hole_id
join player_rounds pr      on pr.id = s.player_round_id
join tournament_rounds tr  on tr.id = pr.tournament_round_id
join handicap_snapshots hs on hs.tournament_id = tr.tournament_id
                           and hs.player_id = pr.player_id;


-- ── V: ROUND TOTALS ──────────────────────────────────────────
-- Gross and net totals per player per day, plus vs-par.

create or replace view v_round_totals as
select
  player_round_id,
  player_id,
  tournament_id,
  day_number,
  course_id,
  playing_handicap,
  count(*)                        as holes_completed,
  sum(gross_strokes)              as gross_total,
  sum(net_strokes)                as net_total,
  sum(net_strokes) - (
    select sum(h2.par)
    from holes h2
    where h2.course_id = v_hole_scores.course_id
  )                               as net_vs_par
from v_hole_scores
group by
  player_round_id, player_id, tournament_id,
  day_number, course_id, playing_handicap;


-- ── V: TOURNAMENT DIFFERENTIAL ───────────────────────────────
-- WHS differential per round: (gross - course_rating) * 113 / slope
-- Used to compute future Tiff handicaps.

create or replace view v_differentials as
select
  pr.player_id,
  tr.tournament_id,
  tr.day_number,
  t.year,
  c.name as course_name,
  c.course_rating,
  c.slope,
  rt.gross_total,
  round(
    (rt.gross_total - c.course_rating) * 113.0 / c.slope,
    1
  ) as differential
from v_round_totals rt
join player_rounds pr      on pr.id = rt.player_round_id
join tournament_rounds tr  on tr.id = pr.tournament_round_id
join tournaments t         on t.id  = tr.tournament_id
join courses c             on c.id  = tr.course_id
where rt.holes_completed = 18;   -- only complete rounds count


-- ── V: TIFF HANDICAP CALC ────────────────────────────────────
-- For each player, compute their Tiff handicap going INTO
-- a given year (excludes that year's rounds).
-- Uses best 8 of last 20 differentials * 0.96 (WHS method).
-- App uses this to pre-populate the commissioner dashboard.

create or replace view v_tiff_handicap_by_year as
with ranked as (
  select
    d.player_id,
    d.year,
    d.differential,
    count(*) over (
      partition by d.player_id
      order by d.year, d.day_number
      rows between unbounded preceding and current row
    ) as cumulative_rounds
  from v_differentials d
),
prior_rounds as (
  -- For each year, look at rounds from all PRIOR years only
  select
    r.player_id,
    r.year                            as for_year,
    r.differential,
    row_number() over (
      partition by r.player_id, r.year
      order by r.differential asc     -- best (lowest) first
    ) as diff_rank,
    count(*) over (
      partition by r.player_id, r.year
    ) as total_rounds
  from (
    select
      d.player_id,
      target.year as year,
      d.differential
    from v_differentials d
    cross join (select distinct year from tournaments) target
    where d.year < target.year        -- prior years only
    order by d.year desc
    limit 20                          -- last 20 rounds max
  ) r
)
select
  player_id,
  for_year                             as year,
  total_rounds,
  round(
    avg(differential) filter (where diff_rank <= 8) * 0.96,
    1
  )                                    as tiff_handicap,
  case
    when total_rounds >= 20 then 'established'
    when total_rounds >= 5  then 'established'
    when total_rounds >= 3  then 'provisional'
    else 'insufficient'
  end                                  as tier
from prior_rounds
group by player_id, for_year, total_rounds;


-- ── V: LEADERBOARD ───────────────────────────────────────────
-- Live leaderboard for a tournament.
-- Cumulative net score across completed rounds.

create or replace view v_leaderboard as
select
  rt.player_id,
  rt.tournament_id,
  p.name                            as player_name,
  hs.playing_handicap,
  hs.method                         as handicap_method,
  count(distinct rt.day_number)     as rounds_complete,
  sum(rt.gross_total)               as total_gross,
  sum(rt.net_total)                 as total_net,
  sum(rt.net_vs_par)                as total_vs_par,

  -- For "thru X" display: max holes completed on in-progress round
  max(rt.holes_completed)
    filter (where rt.holes_completed < 18) as holes_in_progress,

  rank() over (
    partition by rt.tournament_id
    order by sum(rt.net_total) asc
  )                                 as position

from v_round_totals rt
join players p          on p.id  = rt.player_id
join handicap_snapshots hs on hs.tournament_id = rt.tournament_id
                          and hs.player_id     = rt.player_id
group by
  rt.player_id, rt.tournament_id,
  p.name, hs.playing_handicap, hs.method;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Enable RLS on all tables, then define policies.

alter table players             enable row level security;
alter table tournaments         enable row level security;
alter table courses             enable row level security;
alter table holes               enable row level security;
alter table tournament_rounds   enable row level security;
alter table foursomes           enable row level security;
alter table foursome_players    enable row level security;
alter table handicap_snapshots  enable row level security;
alter table player_rounds       enable row level security;
alter table scores              enable row level security;

-- Everyone can read everything (it's a friend group, not a bank)
create policy "Public read" on players            for select using (true);
create policy "Public read" on tournaments        for select using (true);
create policy "Public read" on courses            for select using (true);
create policy "Public read" on holes              for select using (true);
create policy "Public read" on tournament_rounds  for select using (true);
create policy "Public read" on foursomes          for select using (true);
create policy "Public read" on foursome_players   for select using (true);
create policy "Public read" on handicap_snapshots for select using (true);
create policy "Public read" on player_rounds      for select using (true);
create policy "Public read" on scores             for select using (true);

-- Scores: scorekeepers can insert/update scores for their foursome
create policy "Scorekeeper can enter scores" on scores
  for insert
  with check (
    entered_by = auth.uid()
    and exists (
      select 1 from player_rounds pr
      join foursomes f            on f.id = pr.foursome_id
      where pr.id = scores.player_round_id
      and f.scorekeeper_id = auth.uid()
    )
  );

create policy "Scorekeeper can update scores" on scores
  for update
  using (
    entered_by = auth.uid()
    or exists (select 1 from players where id = auth.uid() and is_admin = true)
  );

-- Admin-only writes for everything else
create policy "Admin only insert" on tournaments
  for insert with check (
    exists (select 1 from players where id = auth.uid() and is_admin = true)
  );

create policy "Admin only insert" on handicap_snapshots
  for insert with check (
    exists (select 1 from players where id = auth.uid() and is_admin = true)
  );

create policy "Admin only update" on handicap_snapshots
  for update using (
    exists (select 1 from players where id = auth.uid() and is_admin = true)
  );

create policy "Admin can lock tournaments" on tournaments
  for update using (
    exists (select 1 from players where id = auth.uid() and is_admin = true)
  );


-- ============================================================
-- REALTIME
-- ============================================================
-- Enable realtime on scores so the leaderboard updates live.

alter publication supabase_realtime add table scores;
alter publication supabase_realtime add table player_rounds;


-- ============================================================
-- SAMPLE SEED DATA (for development)
-- ============================================================

-- Insert a course
insert into courses (name, short_name, location, par, course_rating, slope)
values ('Pebble Beach Golf Links', 'Pebble Beach', 'Pebble Beach, CA', 72, 75.5, 145);

-- Then insert 18 holes for it (abbreviated — full seed would have all 18)
-- with (select id from courses where short_name = 'Pebble Beach') as c
-- insert into holes (course_id, hole_number, par, stroke_index, yards) values
--   (c.id, 1, 4, 7, 381),
--   (c.id, 2, 5, 11, 502),
--   ...

-- Insert the 2025 tournament
insert into tournaments (year, location, name, status)
values (2025, 'Pebble Beach', 'The 7th Annual Tiff', 'upcoming');
