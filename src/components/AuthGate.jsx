import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePlayerContext } from '../contexts/PlayerContext'

export default function AuthGate() {
  const { session, loading } = usePlayerContext()
  const location = useLocation()

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '0.75rem', color: 'rgba(242,237,227,0.4)',
      textTransform: 'uppercase', letterSpacing: '0.2em',
      background: 'var(--sc-green)',
    }}>
      Loading…
    </div>
  )

  if (!session) return <Navigate to="/login" state={{ from: location }} replace />

  return <Outlet />
}
