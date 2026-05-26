import { Navigate } from 'react-router-dom'
import { usePlayerContext } from '../contexts/PlayerContext'
import Commissioner from './Commissioner'

export default function CommissionerRoute() {
  const { player, tournament } = usePlayerContext()
  if (!player?.is_admin) return <Navigate to="/" replace />
  return <Commissioner tournament={tournament} />
}
