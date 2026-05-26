-- ============================================================
-- Migration: historical_rounds table + updated v_differentials
-- Run this in Supabase SQL editor before running seed-historical.js
-- ============================================================

-- Stores pre-app round totals where we have gross score but not
-- hole-by-hole data. The differential is stored directly from
-- the source (not recomputed) so historical course rating/slope
-- changes don't affect past handicap calculations.

create table historical_rounds (
  id                  uuid primary key default gen_random_uuid(),
  player_id           uuid not null references players(id),
  tournament_round_id uuid not null references tournament_rounds(id),
  gross_total         int not null,
  differential        numeric(4,1) not null,
  created_at          timestamptz default now(),
  unique (tournament_round_id, player_id)
);

alter table historical_rounds enable row level security;

create policy "Public read" on historical_rounds
  for select using (true);

create policy "Admin only insert" on historical_rounds
  for insert with check (
    exists (select 1 from players where id = auth.uid() and is_admin = true)
  );


-- Update v_differentials to union live rounds with historical rounds.
-- The handicap calc view (v_tiff_handicap_by_year) works unchanged.

create or replace view v_differentials as

-- Live rounds: derived from hole-by-hole scores
select
  pr.player_id,
  tr.tournament_id,
  tr.day_number,
  t.year,
  c.name        as course_name,
  c.course_rating,
  c.slope,
  rt.gross_total,
  round(
    (rt.gross_total - c.course_rating) * 113.0 / c.slope,
    1
  )             as differential
from v_round_totals rt
join player_rounds pr     on pr.id = rt.player_round_id
join tournament_rounds tr on tr.id = pr.tournament_round_id
join tournaments t        on t.id  = tr.tournament_id
join courses c            on c.id  = tr.course_id
where rt.holes_completed = 18

union all

-- Historical rounds: gross total only, differential stored directly
select
  hr.player_id,
  tr.tournament_id,
  tr.day_number,
  t.year,
  c.name        as course_name,
  c.course_rating,
  c.slope,
  hr.gross_total,
  hr.differential
from historical_rounds hr
join tournament_rounds tr on tr.id = hr.tournament_round_id
join tournaments t        on t.id  = tr.tournament_id
join courses c            on c.id  = tr.course_id;
