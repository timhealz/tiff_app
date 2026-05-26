import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function usePlayerProfile(playerId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) return
    async function load() {
      const [player, results, rounds, hcps] = await Promise.all([
        supabase
          .from('players')
          .select('id, name, full_name, ghin, ghin_index')
          .eq('id', playerId)
          .maybeSingle(),
        supabase
          .from('tournament_results')
          .select('position, playing_handicap, gross_total, net_total, rounds_played, dnf, tournaments(id, year, location)')
          .eq('player_id', playerId),
        supabase
          .from('historical_rounds')
          .select('gross_total, differential, tournament_rounds(day_number, tournament_id, courses(short_name, name, par), tournaments(year))')
          .eq('player_id', playerId),
        supabase
          .from('v_tiff_handicap_by_year')
          .select('year, tiff_handicap, tier, total_rounds')
          .eq('player_id', playerId)
          .order('year', { ascending: true }),
      ])

      setData({
        player:  player.data,
        results: results.data ?? [],
        rounds:  rounds.data  ?? [],
        hcps:    hcps.data    ?? [],
      })
      setLoading(false)
    }
    load()
  }, [playerId])

  return { data, loading }
}
