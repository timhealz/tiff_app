import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useScorecard(foursomeId) {
  const [foursome, setFoursome] = useState(null)
  const [players, setPlayers] = useState([])
  const [holes, setHoles] = useState([])
  const [scores, setScores] = useState({}) // { [playerId_holeId]: grossStrokes }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!foursomeId) return
    fetchFoursome()
  }, [foursomeId])

  async function fetchFoursome() {
    // Stub — full implementation in scorecard build step
    setLoading(false)
  }

  async function enterScore({ playerRoundId, holeId, grossStrokes, enteredBy }) {
    const { error } = await supabase
      .from('scores')
      .upsert({
        player_round_id: playerRoundId,
        hole_id: holeId,
        gross_strokes: grossStrokes,
        entered_by: enteredBy,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'player_round_id,hole_id' })

    if (error) throw error
  }

  return { foursome, players, holes, scores, loading, error, enterScore }
}
