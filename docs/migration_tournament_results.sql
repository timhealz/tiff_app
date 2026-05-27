-- ============================================================
-- tournament_results historical seed (2021–2026)
-- Run AFTER the schema migration that creates the table.
-- ============================================================

-- Helper: match players by name (case-insensitive, partial ok)
-- All net_total values are the actual spreadsheet figures.

-- 2021 (Tiff 2, Orlando) — Peoria system, 3 rounds (2 par-72 + 1 par-70)
-- playing_handicap stored as 0 (Peoria varies per round)
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 1, 0, 259, 220, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Kris Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 2, 0, 247, 229, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Keith Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 3, 0, 299, 236, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Andrew Parker'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 4, 0, 289, 238, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'James Cristaldi'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 5, 0, 308, 254, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Jeremy Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 6, 0, 324, 256, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Corey Sheehan'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 7, 0, 316, 262, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Tim Healy'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 8, 0, 344, 268, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Randall Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 9, 0, 351, 286, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Josh Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 10, 0, 333, 288, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Reid Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 11, 0, 371, 300, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Aaron Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 12, 0, 405, 329, 3, false
FROM tournaments t, players p
WHERE t.year = 2021 AND p.full_name = 'Chris Bales'
ON CONFLICT DO NOTHING;

-- 2022 (Tiff 3, San Antonio) — fixed handicaps, 3 rounds
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 1, 14, 274, 232, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Chris Rawlings'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 2, 14, 275, 233, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Chris Williams'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 3, 10, 265, 235, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Toby Parker'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 4, 12, 275, 239, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Andrew Parker'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 5, 15, 286, 241, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Tim Healy'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 6, 14, 284, 242, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Corey Sheehan'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 7, 6, 264, 246, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Keith Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 8, 14, 295, 253, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Jeremy Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 9, 22, 328, 262, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Aaron Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 10, 13, 311, 272, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Reid Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 11, 20, 333, 273, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Randall Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 12, 18, 333, 279, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Adrian Lim'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 13, 20, 350, 290, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Bill Walter'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 14, 22, 367, 301, 3, false
FROM tournaments t, players p
WHERE t.year = 2022 AND p.full_name = 'Chris Bales'
ON CONFLICT DO NOTHING;

-- 2023 (Tiff 4, Scottsdale) — no-Peoria result confirmed, 3 rounds
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 1, 17, 278, 227, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'James Cristaldi'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 2, 15, 272, 227, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Chris Rawlings'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 3, 16, 276, 228, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Tim Healy'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 4, 17, 280, 229, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Corey Sheehan'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 5, 8, 254, 230, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Keith Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 6, 13, 278, 239, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Reid Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 7, 15, 284, 239, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Jeremy Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 8, 15, 289, 244, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Josh Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 9, 23, 317, 248, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Rob Bullington'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 10, 22, 316, 250, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Randall Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 11, 26, 330, 252, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Aaron Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 12, 20, 319, 259, 3, false
FROM tournaments t, players p
WHERE t.year = 2023 AND p.full_name = 'Jeff Guthridge'
ON CONFLICT DO NOTHING;

-- 2024 (Tiff 5, Tampa) — WHS-style handicaps, 3 rounds
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 1, 17, 270, 219, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Chris Rawlings'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 2, 9, 252, 225, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Brian Lynn'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 3, 18, 281, 227, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Jeremy Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 4, 20, 292, 232, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Doug Gibson'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 5, 18, 295, 241, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'James Cristaldi'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 6, 22, 307, 241, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Rob Bullington'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 7, 15, 288, 243, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Chris Williams'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 8, 20, 304, 244, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Randall Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 9, 17, 297, 246, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Tim Healy'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 10, 9, 274, 247, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Keith Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 11, 22, 318, 252, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Jeff Guthridge'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 12, 13, 292, 253, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Reid Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 13, 17, 311, 260, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Josh Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 14, 3, 270, 261, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Kris Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 15, 18, 318, 264, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Corey Sheehan'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 16, 13, 304, 265, 3, false
FROM tournaments t, players p
WHERE t.year = 2024 AND p.full_name = 'Mike Coulter'
ON CONFLICT DO NOTHING;

-- 2025 (Tiff 6, Hilton Head) — fractional WHS handicaps, 3 rounds
-- Mike Coulter and Ben Wade withdrew (DNF) — scored 150 in round 3
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 1, 8.99, 253, 226.02, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Brian Lynn'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 2, 14.87, 284, 239.27, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Tim Healy'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 3, 12.72, 279, 240.56, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Chris Rawlings'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 4, 14.92, 286, 241.16, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Chris Williams'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 5, 8.64, 268, 241.72, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Kris Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 6, 10.17, 275, 244.66, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Keith Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 7, 21.85, 315, 249.29, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Rob Bullington'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 8, 17.43, 302, 250.15, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'James Cristaldi'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 9, 14.76, 299, 254.48, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Jeremy Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 10, 22.0, 322, 256.0, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Doug Peterson'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 11, 17.19, 318, 266.62, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Josh Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 12, 12.91, 306, 267.19, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Reid Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 13, 21.2, 334, 270.6, 3, false
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Jeff Guthridge'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, NULL, 15.93, NULL, NULL, 3, true
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Mike Coulter'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, NULL, 11.17, NULL, NULL, 3, true
FROM tournaments t, players p
WHERE t.year = 2025 AND p.full_name = 'Ben Wade'
ON CONFLICT DO NOTHING;

-- 2026 (Tiff 7, Hilton Head) — 3 rounds, net scores from leaderboard sheet
-- Randall Chenworth, Kris Wiltfong, Keith Wiltfong DNF (#N/A in spreadsheet)
-- New players (PJ O'Donnell, Jake Bullington, Bryan O'Donnell, Joe Gibson) must be
-- inserted into players table first — see below.

-- Step 1: add new players (replace emails with real ones if available)
INSERT INTO players (email, name, full_name) VALUES ('pj.odonnell@tiff.local', 'PJ', 'PJ O''Donnell') ON CONFLICT (email) DO NOTHING;
INSERT INTO players (email, name, full_name) VALUES ('jake.bullington@tiff.local', 'Jake', 'Jake Bullington') ON CONFLICT (email) DO NOTHING;
INSERT INTO players (email, name, full_name) VALUES ('bryan.odonnell@tiff.local', 'Bryan O.', 'Bryan O''Donnell') ON CONFLICT (email) DO NOTHING;
INSERT INTO players (email, name, full_name) VALUES ('joe.gibson@tiff.local', 'Joe G.', 'Joe Gibson') ON CONFLICT (email) DO NOTHING;

-- Step 2: 2026 tournament results
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 1, 28, 298, 214, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'PJ O''Donnell'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 2, 25, 293, 218, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Rob Bullington'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 3, 8, 247, 223, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Brian Lynn'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 4, 15, 272, 227, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Chris Rawlings'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 5, 16, 276, 228, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Tim Healy'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 6, 16, 278, 230, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Jake Bullington'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 7, 21, 296, 233, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Bryan O''Donnell'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 8, 18, 290, 236, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Jeremy Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 9, 26, 316, 238, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Doug Peterson'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 10, 20, 303, 243, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Doug Gibson'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 11, 16, 294, 246, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Reid Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 12, 21, 313, 250, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Corey Sheehan'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 13, 20, 310, 250, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Joe Gibson'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 14, 17, 302, 251, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Mike Coulter'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 15, 19, 316, 259, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'James Cristaldi'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 16, 25, 338, 263, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Jeff Guthridge'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, 17, 18, 323, 269, 3, false
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Josh Stonecypher'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, NULL, 21, NULL, NULL, 3, true
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Randall Chenworth'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, NULL, 8, NULL, NULL, 3, true
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Kris Wiltfong'
ON CONFLICT DO NOTHING;
INSERT INTO tournament_results (tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf)
SELECT t.id, p.id, NULL, 12, NULL, NULL, 3, true
FROM tournaments t, players p
WHERE t.year = 2026 AND p.full_name = 'Keith Wiltfong'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Verification: check counts
-- SELECT t.year, count(*) FROM tournament_results tr
-- JOIN tournaments t ON t.id = tr.tournament_id
-- GROUP BY t.year ORDER BY t.year;
-- Expected: 2021→12, 2022→14, 2023→12, 2024→16, 2025→15, 2026→20
-- ============================================================

-- Generated 93 INSERT statements
