-- ============================================================
-- Step 1: Run this migration FIRST (creates table + adds date column)
-- ============================================================

-- Add date field to tournaments for the countdown timer
alter table tournaments add column if not exists date date;

-- Historical and future final standings per player per tournament
create table if not exists tournament_results (
  tournament_id    uuid not null references tournaments(id) on delete cascade,
  player_id        uuid not null references players(id) on delete cascade,
  position         int,                        -- nullable: DNF players have no position
  playing_handicap numeric(4,1) not null,
  gross_total      int,                        -- nullable: DNF
  net_total        numeric(6,2),               -- nullable: DNF; decimal for fractional HCPs
  rounds_played    int not null default 3,     -- Tiff 2 had only 3 rounds (2 par-72 + 1 par-70)
  dnf              boolean not null default false,
  primary key (tournament_id, player_id)
);

create index if not exists tournament_results_tournament_position_idx
  on tournament_results (tournament_id, position);

alter table tournament_results enable row level security;

create policy "Public read" on tournament_results
  for select using (true);

create policy "Admin only write" on tournament_results
  for all using (
    exists (select 1 from players where id = auth.uid() and is_admin)
  );

-- ============================================================
-- After this runs successfully, run migration_tournament_results.sql
-- ============================================================
