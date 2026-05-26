import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useHome() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        t,
        r,
        p,
        h,
        hr,
      ] = await Promise.all([
        supabase
          .from('tournaments')
          .select('id, year, location, name')
          .eq('status', 'complete')
          .order('year', { ascending: false }),
        supabase
          .from('tournament_results')
          .select('tournament_id, player_id, position, playing_handicap, gross_total, net_total, rounds_played, dnf, players(id, name, full_name)')
          .not('dnf', 'eq', true)
          .not('position', 'is', null)
          .order('position'),
        supabase
          .from('players')
          .select('id, name, full_name')
          .order('full_name'),
        supabase
          .from('v_tiff_handicap_by_year')
          .select('player_id, year, tiff_handicap, total_rounds, tier'),
        supabase
          .from('historical_rounds')
          .select('player_id, gross_total, differential'),
      ])

      setData({
        completedTournaments: t.data ?? [],
        results:              r.data ?? [],
        players:              p.data ?? [],
        allHcps:              h.data ?? [],
        histRounds:           hr.data ?? [],
      })
      setLoading(false)
    }

    load()
  }, [])

  return { data, loading }
}
