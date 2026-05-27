-- Fix typo: Bryan Lynn → Brian Lynn
-- Update both full_name and the short `name` field if it also has the misspelling.
update players
   set full_name = 'Brian Lynn',
       name      = case when name ilike 'bryan%' then 'Brian L.' else name end
 where full_name = 'Bryan Lynn';

-- Grant commissioner (is_admin) to Reid Chenworth, Rob Bullington, Brian Lynn.
update players
   set is_admin = true
 where full_name in ('Reid Chenworth', 'Rob Bullington', 'Brian Lynn');

-- Verify
select id, name, full_name, is_admin
  from players
 where full_name in ('Reid Chenworth', 'Rob Bullington', 'Brian Lynn');
