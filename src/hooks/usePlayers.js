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
          .select('player_id, position, tournament_id, playing_handicap')
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
        if (!stats[r.player_id]) stats[r.player_id] = { wins: 0, trips: 0, bestFinish: Infinity, tournamentIds: new Set() }
        const s = stats[r.player_id]
        s.tournamentIds.add(r.tournament_id)
        s.trips = s.tournamentIds.size
        if (r.position === 1) s.wins++
        if (r.position < s.bestFinish) s.bestFinish = r.position
      })

      const enriched = players.map(player => ({
        ...player,
        hcp:        currentHcpByPlayer[player.id] ?? null,
        wins:       stats[player.id]?.wins ?? 0,
        trips:      stats[player.id]?.trips ?? 0,
        bestFinish: stats[player.id]?.bestFinish === Infinity ? null : stats[player.id]?.bestFinish,
        isChampion: (stats[player.id]?.wins ?? 0) > 0,
      }))

      setData(enriched)
      setLoading(false)
    }

    load()
  }, [])

  return { data, loading }
}
