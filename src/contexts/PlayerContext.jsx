import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabaseClient'

const PlayerCtx = createContext(null)

export function PlayerProvider({ children }) {
  const { session, player, loading, signIn, signOut } = useAuth()
  const [tournament, setTournament] = useState(null)
  const [tLoading, setTLoading] = useState(true)

  useEffect(() => {
    if (!session) { setTLoading(false); return }
    supabase
      .from('tournaments')
      .select('id, year, name, status, location, handicaps_locked, date')
      .order('year', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { setTournament(data); setTLoading(false) })
  }, [session])

  return (
    <PlayerCtx.Provider value={{ session, player, loading: loading || tLoading, signIn, signOut, tournament }}>
      {children}
    </PlayerCtx.Provider>
  )
}

export function usePlayerContext() {
  return useContext(PlayerCtx)
}
