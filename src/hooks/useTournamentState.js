import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Returns the current state of the tournament calendar.
 *
 *   {
 *     active:             tournament with status='active' (or null)
 *     upcoming:           tournament with status='upcoming' (or null)
 *     mostRecentComplete: most recent completed tournament (or null)
 *   }
 *
 * Used by Layout for the Home→Live tab swap and by Home for mode detection.
 */
export function useTournamentState() {
  const [data, setData] = useState({
    active: null,
    upcoming: null,
    mostRecentComplete: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: tournaments } = await supabase
        .from('tournaments')
        .select('id, year, location, name, status, date')
        .order('year', { ascending: false })

      const list = tournaments ?? []
      setData({
        active:             list.find(t => t.status === 'active') ?? null,
        upcoming:           list.find(t => t.status === 'upcoming') ?? null,
        mostRecentComplete: list.find(t => t.status === 'complete') ?? null,
      })
      setLoading(false)
    }
    load()
  }, [])

  return { data, loading }
}
