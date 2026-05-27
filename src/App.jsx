import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { PlayerProvider } from './contexts/PlayerContext'
import AuthGate from './components/AuthGate'
import Layout from './Layout'
import Auth from './components/Auth'
import Home from './components/Home'
import Players from './components/Players'
import PlayerProfile from './components/PlayerProfile'
import Tournaments from './pages/Tournaments'
import TournamentDetail from './pages/Tournaments/TournamentDetail'
import Records from './pages/Records'
import CommissionerRoute from './components/CommissionerRoute'

function HistoryYearRedirect() {
  const { year } = useParams()
  return <Navigate to={`/tournaments/${year}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route element={<AuthGate />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:year" element={<TournamentDetail />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id" element={<PlayerProfile />} />
              <Route path="/records" element={<Records />} />
              <Route path="/commissioner" element={<CommissionerRoute />} />
              {/* Legacy redirects */}
              <Route path="/history" element={<Navigate to="/tournaments" replace />} />
              <Route path="/history/:year" element={<HistoryYearRedirect />} />
            </Route>
          </Route>
          <Route path="/login" element={<Auth />} />
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  )
}
