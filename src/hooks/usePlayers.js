import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function usePlayers() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const currentYear = new Date().getFullYear()

      const [p, r, h] = await Promise.all([
        supabase
          .from('players')
          .select('id, name, full_name')
          .order('full_name'),
        supabase
          .from('tournament_results')
          .select('player_id, position, tournament_id, net_total, rounds_played')
          .not('dnf', 'eq', true)
          .not('position', 'is', null),
        supabase
          .from('v_tiff_handicap_by_year')
          .select('player_id, year, tiff_handicap, total_rounds, tier')
          .gte('year', currentYear - 1)
          .lte('year', currentYear + 1),
      ])

      const players = p.data ?? []
      const results = r.data ?? []
      const hcps    = h.data ?? []

      // Current HCP per player (max year available)
      const maxYear = hcps.reduce((m, r) => Math.max(m, r.year), 0)
      const currentHcpByPlayer = Object.fromEntries(
        hcps.filter(r => r.year === maxYear).map(r => [r.player_id, r])
      )

      // Aggregate stats per player
      const stats = {}
      results.forEach(r => {
        if (!stats[r.player_id]) stats[r.player_id] = { wins: 0, trips: 0, bestFinish: Infinity, vsParSum: 0, vsParCount: 0, tournamentIds: new Set() }
        const s = stats[r.player_id]
        s.tournamentIds.add(r.tournament_id)
        s.trips = s.tournamentIds.size
        if (r.position === 1) s.wins++
        if (r.position < s.bestFinish) s.bestFinish = r.position
        if (r.net_total != null && r.rounds_played) {
          s.vsParSum += Number(r.net_total) - r.rounds_played * 72
          s.vsParCount++
        }
      })

      const enriched = players.map(player => {
        const st = stats[player.id]
        return {
          ...player,
          hcp:        currentHcpByPlayer[player.id] ?? null,
          wins:       st?.wins ?? 0,
          trips:      st?.trips ?? 0,
          bestFinish: st?.bestFinish === Infinity ? null : st?.bestFinish,
          isChampion: (st?.wins ?? 0) > 0,
          avgVsPar:   st?.vsParCount ? st.vsParSum / st.vsParCount : null,
        }
      })

      setData(enriched)
      setLoading(false)
    }

    load()
  }, [])

  return { data, loading }
}
