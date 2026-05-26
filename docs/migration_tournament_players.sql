-- Roster for each tournament year.
-- Commissioner sets this before reviewing handicaps.
-- Only players in this table get handicap_snapshots written on lock.

create table tournament_players (
  tournament_id  uuid not null references tournaments(id) on delete cascade,
  player_id      uuid not null references players(id),
  primary key (tournament_id, player_id)
);

alter table tournament_players enable row level security;

create policy "Public read" on tournament_players
  for select using (true);

create policy "Admin only insert" on tournament_players
  for insert with check (
    exists (select 1 from players where id = auth.uid() and is_admin = true)
  );

create policy "Admin only delete" on tournament_players
  for delete using (
    exists (select 1 from players where id = auth.uid() and is_admin = true)
  );
