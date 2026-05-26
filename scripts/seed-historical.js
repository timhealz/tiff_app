#!/usr/bin/env node
// Seed historical round data from docs/historical_scores.csv
//
// Requires the service role key to bypass RLS for bulk insert.
// Get it from: Supabase → Settings → API → service_role (Secret) key
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-historical.js

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import ws from 'ws'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
})

const csv = readFileSync(join(__dirname, '../docs/historical_scores.csv'), 'utf8')
const rows = parse(csv, { columns: true, skip_empty_lines: true })

function displayName(fullName) {
  const parts = fullName.trim().split(' ')
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`
}

function placeholderEmail(fullName) {
  return fullName.toLowerCase().replace(/\s+/g, '.') + '@tiff.local'
}

async function seed() {
  console.log(`Parsed ${rows.length} rows from CSV\n`)

  // ── Players ──────────────────────────────────────────────────
  const uniqueNames = [...new Set(rows.map(r => r.Golfer))]
  console.log(`Players (${uniqueNames.length} unique):`)

  const { data: existingPlayers, error: playersErr } = await supabase.from('players').select('id, full_name')
  if (playersErr) { console.error('Failed to fetch players:', playersErr.message); process.exit(1) }
  if (!existingPlayers) { console.error('No response from players table — check service role key'); process.exit(1) }
  const playerByName = Object.fromEntries(existingPlayers.map(p => [p.full_name, p]))

  for (const fullName of uniqueNames) {
    if (playerByName[fullName]) {
      console.log(`  ✓ ${fullName}`)
      continue
    }
    const { data, error } = await supabase
      .from('players')
      .insert({ name: displayName(fullName), full_name: fullName, email: placeholderEmail(fullName) })
      .select()
      .single()
    if (error) console.error(`  ✗ ${fullName}: ${error.message}`)
    else { playerByName[fullName] = data; console.log(`  + ${fullName}`) }
  }

  // ── Courses ───────────────────────────────────────────────────
  // Rating/slope from CSV are the historical values — stored as-is.
  const csvCourses = {}
  for (const row of rows) {
    if (!csvCourses[row.Course]) {
      csvCourses[row.Course] = {
        course_rating: parseFloat(row['Course Rating']),
        slope: parseInt(row['Slope Rating']),
      }
    }
  }
  console.log(`\nCourses (${Object.keys(csvCourses).length} unique):`)

  const { data: existingCourses } = await supabase.from('courses').select('id, name')
  const courseByName = Object.fromEntries(existingCourses.map(c => [c.name, c]))

  for (const [name, { course_rating, slope }] of Object.entries(csvCourses)) {
    if (courseByName[name]) { console.log(`  ✓ ${name}`); continue }
    const { data, error } = await supabase
      .from('courses')
      .insert({ name, short_name: name.split(',')[0].trim(), course_rating, slope, par: 72 })
      .select()
      .single()
    if (error) console.error(`  ✗ ${name}: ${error.message}`)
    else { courseByName[name] = data; console.log(`  + ${name}`) }
  }

  // ── Tournaments ───────────────────────────────────────────────
  const uniqueYears = [...new Set(rows.map(r => parseInt(r.Year)))].sort()
  console.log(`\nTournaments (${uniqueYears.length} years):`)

  const { data: existingTournaments } = await supabase.from('tournaments').select('id, year')
  const tournamentByYear = Object.fromEntries(existingTournaments.map(t => [t.year, t]))

  for (const year of uniqueYears) {
    if (tournamentByYear[year]) { console.log(`  ✓ ${year}`); continue }
    const { data, error } = await supabase
      .from('tournaments')
      .insert({ year, location: 'Historical', status: 'complete' })
      .select()
      .single()
    if (error) console.error(`  ✗ ${year}: ${error.message}`)
    else { tournamentByYear[year] = data; console.log(`  + ${year}`) }
  }

  // ── Tournament rounds ─────────────────────────────────────────
  // Day number = order the course first appears in CSV for that year
  const dayByYearCourse = {}
  const dayCounter = {}
  for (const row of rows) {
    const year = parseInt(row.Year)
    const key = `${year}::${row.Course}`
    if (!(key in dayByYearCourse)) {
      dayCounter[year] = (dayCounter[year] ?? 0) + 1
      dayByYearCourse[key] = dayCounter[year]
    }
  }

  console.log('\nTournament rounds:')
  const { data: existingRounds } = await supabase
    .from('tournament_rounds')
    .select('id, tournament_id, course_id, day_number')
  const roundByTournamentCourse = Object.fromEntries(
    existingRounds.map(r => [`${r.tournament_id}::${r.course_id}`, r])
  )
  const roundByKey = {}

  for (const [key, dayNumber] of Object.entries(dayByYearCourse)) {
    const [year, course] = key.split('::')
    const tournament = tournamentByYear[parseInt(year)]
    const courseRecord = courseByName[course]
    if (!tournament || !courseRecord) { console.error(`  ✗ Missing refs for ${key}`); continue }

    const tcKey = `${tournament.id}::${courseRecord.id}`
    if (roundByTournamentCourse[tcKey]) {
      roundByKey[key] = roundByTournamentCourse[tcKey]
      console.log(`  ✓ ${year} day ${dayNumber}: ${course}`)
      continue
    }
    const { data, error } = await supabase
      .from('tournament_rounds')
      .insert({ tournament_id: tournament.id, course_id: courseRecord.id, day_number: dayNumber })
      .select()
      .single()
    if (error) console.error(`  ✗ ${year}/${course}: ${error.message}`)
    else {
      roundByKey[key] = data
      roundByTournamentCourse[tcKey] = data
      console.log(`  + ${year} day ${dayNumber}: ${course}`)
    }
  }

  // ── Historical rounds ─────────────────────────────────────────
  console.log('\nHistorical rounds:')
  let inserted = 0, errors = 0

  for (const row of rows) {
    const year = parseInt(row.Year)
    const key = `${year}::${row.Course}`
    const round = roundByKey[key]
    const player = playerByName[row.Golfer]

    if (!round || !player) {
      console.error(`  ✗ Missing ref: ${row.Golfer} @ ${row.Course} ${year}`)
      errors++
      continue
    }

    const gross = parseInt(row.Score)
    const rating = parseFloat(row['Course Rating'])
    const slope = parseInt(row['Slope Rating'])
    const differential = Math.round((gross - rating) * 113 / slope * 10) / 10

    const { error } = await supabase.from('historical_rounds').upsert({
      player_id: player.id,
      tournament_round_id: round.id,
      gross_total: gross,
      differential,
    }, { onConflict: 'tournament_round_id,player_id' })

    if (error) { console.error(`  ✗ ${row.Golfer} ${year}: ${error.message}`); errors++ }
    else inserted++
  }

  console.log(`\n✓ Done: ${inserted} rounds inserted/updated, ${errors} errors`)
}

seed().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
