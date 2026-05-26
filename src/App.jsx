import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './contexts/PlayerContext'
import AuthGate from './components/AuthGate'
import Layout from './Layout'
import Auth from './components/Auth'
import Home from './components/Home'
import Players from './components/Players'
import PlayerProfile from './components/PlayerProfile'
import History from './components/History'
import TournamentDetail from './components/History/TournamentDetail'
import CommissionerRoute from './components/CommissionerRoute'

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route element={<AuthGate />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id" element={<PlayerProfile />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:year" element={<TournamentDetail />} />
              <Route path="/commissioner" element={<CommissionerRoute />} />
            </Route>
          </Route>
          <Route path="/login" element={<Auth />} />
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  )
}
