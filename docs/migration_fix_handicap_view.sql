-- Fix v_tiff_handicap_by_year
--
-- Original had two bugs:
--   1. LIMIT 20 in a subquery applied globally across all players/years,
--      not per player. Used row_number() instead.
--   2. Only year 2025 appeared because the global ORDER BY year DESC + LIMIT 20
--      selected only the most recent differentials, which only matched 2025
--      as a target year.

create or replace view v_tiff_handicap_by_year as
with all_prior as (
  -- Every differential from years prior to each target tournament year
  select
    d.player_id,
    target.year                   as for_year,
    d.differential,
    row_number() over (
      partition by d.player_id, target.year
      order by d.year desc, d.day_number desc  -- most recent rounds first
    )                             as recency_rank,
    count(*) over (
      partition by d.player_id, target.year
    )                             as total_rounds
  from v_differentials d
  cross join (select distinct year from tournaments) target
  where d.year < target.year
),
last_20 as (
  -- Cap at last 20 rounds per player per target year (WHS rule)
  select
    player_id,
    for_year,
    differential,
    total_rounds,
    row_number() over (
      partition by player_id, for_year
      order by differential asc   -- best (lowest) first within the 20
    ) as diff_rank
  from all_prior
  where recency_rank <= 20
)
select
  player_id,
  for_year                        as year,
  max(total_rounds)               as total_rounds,
  round(
    avg(differential) filter (where diff_rank <= 8) * 0.96,
    1
  )                               as tiff_handicap,
  case
    when max(total_rounds) >= 5  then 'established'
    when max(total_rounds) >= 3  then 'provisional'
    else                              'insufficient'
  end                             as tier
from last_20
group by player_id, for_year;
