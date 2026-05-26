import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useTournamentHistory() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [t, r, allR, players, histRounds] = await Promise.all([
        supabase
          .from('tournaments')
          .select('id, year, location, name')
          .eq('status', 'complete')
          .order('year', { ascending: false }),
        supabase
          .from('tournament_results')
          .select('tournament_id, player_id, position, net_total, rounds_played, dnf, players(full_name, name)')
          .not('dnf', 'eq', true)
          .not('position', 'is', null),
        supabase
          .from('tournament_results')
          .select('tournament_id, player_id, position, net_total, rounds_played')
          .not('dnf', 'eq', true)
          .not('position', 'is', null),
        supabase
          .from('players')
          .select('id, name, full_name')
          .order('full_name'),
        supabase
          .from('historical_rounds')
          .select('player_id, gross_total, differential'),
      ])

      setData({
        tournaments: t.data      ?? [],
        results:     r.data      ?? [],
        allResults:  allR.data   ?? [],
        players:     players.data ?? [],
        histRounds:  histRounds.data ?? [],
      })
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}

export function useTournamentDetail(year) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!year) return
    async function load() {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id, year, location, name')
        .eq('year', year)
        .maybeSingle()

      if (!tournament) { setLoading(false); return }

      const { data: results } = await supabase
        .from('tournament_results')
        .select('player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf, players(full_name, name)')
        .eq('tournament_id', tournament.id)
        .order('dnf')
        .order('position')

      setData({ tournament, results: results ?? [] })
      setLoading(false)
    }
    load()
  }, [year])

  return { data, loading }
}
