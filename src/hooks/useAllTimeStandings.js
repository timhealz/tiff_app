import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Derived all-time standings across every tournament. Each row is one player
 * with wins / podiums / trips / avgVsPar.
 *
 * Sort: wins desc, podiums desc, avgVsPar asc.
 */
export function useAllTimeStandings() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [results, players] = await Promise.all([
        supabase
          .from('tournament_results')
          .select('player_id, position, net_total, rounds_played, tournament_id')
          .not('dnf', 'eq', true)
          .not('position', 'is', null),
        supabase
          .from('players')
          .select('id, name, full_name'),
      ])

      const playersById = Object.fromEntries((players.data ?? []).map(p => [p.id, p]))

      const standings = {}
      ;(results.data ?? []).forEach(r => {
        if (!standings[r.player_id]) {
          standings[r.player_id] = {
            player_id: r.player_id,
            wins: 0,
            podiums: 0,
            vsParSum: 0,
            count: 0,
            tournamentIds: new Set(),
          }
        }
        const e = standings[r.player_id]
        if (r.position === 1) e.wins++
        if (r.position <= 3) e.podiums++
        if (r.net_total != null && r.rounds_played) {
          e.vsParSum += Number(r.net_total) - r.rounds_played * 72
          e.count++
        }
        e.tournamentIds.add(r.tournament_id)
      })

      const arr = Object.values(standings)
        .map(e => ({
          player_id: e.player_id,
          player:    playersById[e.player_id],
          wins:      e.wins,
          podiums:   e.podiums,
          trips:     e.tournamentIds.size,
          avgVsPar:  e.count ? e.vsParSum / e.count : Infinity,
        }))
        .filter(e => e.player)
        .sort((a, b) =>
          b.wins - a.wins ||
          b.podiums - a.podiums ||
          a.avgVsPar - b.avgVsPar
        )

      setData(arr)
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}
