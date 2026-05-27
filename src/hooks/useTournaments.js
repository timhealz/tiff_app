import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Canonical tournaments list. Each item is enriched with its champion
 * (the position=1 finisher from tournament_results, if any).
 *
 * @param {Object} opts
 * @param {number} [opts.limit] - optionally truncate to N most recent
 * @param {string} [opts.status] - 'complete' | 'active' | 'upcoming' | undefined (all)
 */
export function useTournaments({ limit, status } = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      let q = supabase
        .from('tournaments')
        .select('id, year, location, name, status, date')
        .order('year', { ascending: false })
      if (status) q = q.eq('status', status)

      const [tournaments, topThree] = await Promise.all([
        q,
        supabase
          .from('tournament_results')
          .select('tournament_id, player_id, position, net_total, rounds_played, players(id, name, full_name)')
          .lte('position', 3)
          .not('dnf', 'eq', true)
          .order('position'),
      ])

      const podiumByTournament = {}
      ;(topThree.data ?? []).forEach(r => {
        if (!podiumByTournament[r.tournament_id]) podiumByTournament[r.tournament_id] = []
        podiumByTournament[r.tournament_id].push(r)
      })

      let list = (tournaments.data ?? []).map(t => {
        const podium = (podiumByTournament[t.id] ?? []).slice().sort((a, b) => a.position - b.position)
        return {
          ...t,
          podium,
          champion: podium.find(p => p.position === 1) ?? null,
        }
      })

      if (limit) list = list.slice(0, limit)

      setData(list)
      setLoading(false)
    }
    load()
  }, [limit, status])

  return { data, loading }
}
