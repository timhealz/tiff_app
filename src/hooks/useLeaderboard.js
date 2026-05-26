import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useLeaderboard(tournamentId) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tournamentId) return

    fetchLeaderboard()

    // Real-time: re-fetch when any score changes
    const channel = supabase
      .channel('leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, fetchLeaderboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player_rounds' }, fetchLeaderboard)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [tournamentId])

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('v_leaderboard')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('position', { ascending: true })

    if (error) setError(error)
    else setLeaderboard(data)
    setLoading(false)
  }

  return { leaderboard, loading, error }
}
