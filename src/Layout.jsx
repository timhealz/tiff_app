import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { Flag, Users, Trophy, User } from 'lucide-react'
import { usePlayerContext } from './contexts/PlayerContext'
import s from './Layout.module.css'

export default function Layout() {
  const { player, tournament, signOut } = usePlayerContext()
  const navigate  = useNavigate()
  const location  = useLocation()

  const meHref   = player ? `/players/${player.id}` : '/'
  const meActive = location.pathname === meHref

  return (
    <div className={s.shell}>
      <header className={s.header}>
        <Link to="/" className={s.headerTitle}>
          <h1>THE <span>TIFF</span></h1>
          {tournament && (
            <div className={s.headerSub}>{tournament.year} · {tournament.location}</div>
          )}
        </Link>
        <div className={s.headerRight}>
          {tournament?.status === 'active' && (
            <div className={s.livePill}>
              <div className={s.liveDot} />
              Live
            </div>
          )}
          {player?.is_admin && (
            <button className={s.commBtn} onClick={() => navigate('/commissioner')}>
              Commissioner
            </button>
          )}
        </div>
      </header>

      <main className={s.main}>
        <div className={s.inner}>
          <Outlet />
        </div>
      </main>

      <nav className={s.nav}>
        <NavLink to="/" end className={({ isActive }) => `${s.navTab} ${isActive ? s.navTabActive : ''}`}>
          <Flag size={20} strokeWidth={1.75} />
          <span className={s.navLabel}>Home</span>
        </NavLink>
        <NavLink to="/players" end className={({ isActive }) => `${s.navTab} ${isActive ? s.navTabActive : ''}`}>
          <Users size={20} strokeWidth={1.75} />
          <span className={s.navLabel}>Players</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${s.navTab} ${isActive ? s.navTabActive : ''}`}>
          <Trophy size={20} strokeWidth={1.75} />
          <span className={s.navLabel}>History</span>
        </NavLink>
        <NavLink to={meHref} className={`${s.navTab} ${meActive ? s.navTabActive : ''}`}>
          <User size={20} strokeWidth={1.75} />
          <span className={s.navLabel}>Profile</span>
        </NavLink>
      </nav>
    </div>
  )
}
