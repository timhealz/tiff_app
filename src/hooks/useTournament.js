import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Single tournament with its full results and any historical round breakdowns.
 * Looked up by year.
 *
 * Returns { tournament, results, rounds } or null if not found.
 */
export function useTournament(year) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!year) return
    async function load() {
      setLoading(true)
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id, year, location, name, status, date')
        .eq('year', year)
        .maybeSingle()

      if (!tournament) {
        setData(null)
        setLoading(false)
        return
      }

      const [results, rounds] = await Promise.all([
        supabase
          .from('tournament_results')
          .select('player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf, players(full_name, name)')
          .eq('tournament_id', tournament.id)
          .order('dnf')
          .order('position'),
        supabase
          .from('historical_rounds')
          .select('player_id, gross_total, differential, tournament_rounds!inner(day_number, tournament_id, courses(short_name, name, par))')
          .eq('tournament_rounds.tournament_id', tournament.id),
      ])

      setData({
        tournament,
        results: results.data ?? [],
        rounds: rounds.data ?? [],
      })
      setLoading(false)
    }
    load()
  }, [year])

  return { data, loading }
}
