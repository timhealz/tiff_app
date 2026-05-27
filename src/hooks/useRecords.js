import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Derived all-time records — single-round bests + most championships.
 *
 * Returns:
 *   {
 *     mostWins:  { player, count } | null
 *     lowGross:  { player, gross_total, ... } | null
 *     lowDiff:   { player, differential, ... } | null
 *     lowNet:    { player, net_total, rounds_played, ... } | null
 *     totalYears: number
 *     totalRounds: number
 *   }
 *
 * Hole-level records (birdies, eagles) are deferred until live scoring exists.
 */
export function useRecords() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [results, rounds, players, tournaments] = await Promise.all([
        supabase
          .from('tournament_results')
          .select('player_id, position, net_total, rounds_played, tournament_id, dnf'),
        supabase
          .from('historical_rounds')
          .select('player_id, gross_total, differential, tournament_rounds(day_number, tournament_id, courses(short_name))'),
        supabase
          .from('players')
          .select('id, name, full_name'),
        supabase
          .from('tournaments')
          .select('id, year, location, status'),
      ])

      const playersById     = Object.fromEntries((players.data ?? []).map(p => [p.id, p]))
      const tournamentsById = Object.fromEntries((tournaments.data ?? []).map(t => [t.id, t]))

      // Most championships
      const winsByPlayer = {}
      ;(results.data ?? []).forEach(r => {
        if (r.position === 1 && !r.dnf) {
          winsByPlayer[r.player_id] = (winsByPlayer[r.player_id] ?? 0) + 1
        }
      })
      const mostWinsEntry = Object.entries(winsByPlayer)
        .reduce((b, [pid, c]) => (!b || c > b.count) ? { player_id: pid, count: c } : b, null)

      // Low gross round
      const validGross = (rounds.data ?? []).filter(r => r.gross_total > 0)
      const lowGrossEntry = validGross
        .reduce((b, r) => (!b || r.gross_total < b.gross_total) ? r : b, null)

      // Low differential
      const validDiff = (rounds.data ?? []).filter(r => r.differential != null)
      const lowDiffEntry = validDiff
        .reduce((b, r) => (!b || r.differential < b.differential) ? r : b, null)

      // Low net (average net per round, across all tournament results)
      const lowNetEntry = (results.data ?? []).reduce((b, r) => {
        if (!r.net_total || !r.rounds_played || r.dnf) return b
        const avg = Number(r.net_total) / r.rounds_played
        return (!b || avg < b.avg) ? { ...r, avg } : b
      }, null)

      // Tournament metadata helpers
      function tournamentFromRoundEntry(entry) {
        const tid = entry?.tournament_rounds?.tournament_id
        return tid ? tournamentsById[tid] : null
      }

      setData({
        mostWins: mostWinsEntry ? {
          player: playersById[mostWinsEntry.player_id],
          count:  mostWinsEntry.count,
        } : null,
        lowGross: lowGrossEntry ? {
          player:       playersById[lowGrossEntry.player_id],
          gross_total:  lowGrossEntry.gross_total,
          course:       lowGrossEntry.tournament_rounds?.courses?.short_name,
          tournament:   tournamentFromRoundEntry(lowGrossEntry),
        } : null,
        lowDiff: lowDiffEntry ? {
          player:       playersById[lowDiffEntry.player_id],
          differential: lowDiffEntry.differential,
          course:       lowDiffEntry.tournament_rounds?.courses?.short_name,
          tournament:   tournamentFromRoundEntry(lowDiffEntry),
        } : null,
        lowNet: lowNetEntry ? {
          player: playersById[lowNetEntry.player_id],
          avg:    Math.round(lowNetEntry.avg),
        } : null,
        totalYears:  (tournaments.data ?? []).filter(t => t.status === 'complete').length,
        totalRounds: (rounds.data ?? []).length,
      })
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}
