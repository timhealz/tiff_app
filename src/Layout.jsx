import { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, Flag, Users, Trophy, User, Settings } from 'lucide-react'
import { usePlayerContext } from './contexts/PlayerContext'
import s from './Layout.module.css'

export default function Layout() {
  const { player, tournament, signOut } = usePlayerContext()
  const location    = useLocation()
  const [open, setOpen] = useState(false)

  const meHref = player ? `/players/${player.id}` : '/'

  function close() { setOpen(false) }

  return (
    <div className={s.shell}>
      <header className={s.header}>
        <Link to="/" className={s.headerTitle} onClick={close}>
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
          <button className={s.hamburger} onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      {open && <div className={s.backdrop} onClick={close} />}

      <div className={`${s.drawer} ${open ? s.drawerOpen : ''}`}>
        <nav className={s.drawerNav}>
          <NavLink to="/" end className={({ isActive }) => `${s.drawerLink} ${isActive ? s.drawerLinkActive : ''}`} onClick={close}>
            <Flag size={18} strokeWidth={1.75} />
            Home
          </NavLink>
          <NavLink to="/players" className={({ isActive }) => `${s.drawerLink} ${isActive ? s.drawerLinkActive : ''}`} onClick={close}>
            <Users size={18} strokeWidth={1.75} />
            Players
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `${s.drawerLink} ${isActive ? s.drawerLinkActive : ''}`} onClick={close}>
            <Trophy size={18} strokeWidth={1.75} />
            History
          </NavLink>
          <NavLink to={meHref} className={({ isActive }) => `${s.drawerLink} ${isActive ? s.drawerLinkActive : ''}`} onClick={close}>
            <User size={18} strokeWidth={1.75} />
            My Profile
          </NavLink>
          {player?.is_admin && (
            <NavLink to="/commissioner" className={({ isActive }) => `${s.drawerLink} ${isActive ? s.drawerLinkActive : ''}`} onClick={close}>
              <Settings size={18} strokeWidth={1.75} />
              Commissioner
            </NavLink>
          )}
        </nav>
        <button className={s.drawerSignOut} onClick={() => { signOut(); close() }}>
          Sign Out
        </button>
      </div>

      <main className={s.main}>
        <div className={s.inner}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
