import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { Menu, X, Home, Users, Trophy, User, Settings } from 'lucide-react'
import { usePlayerContext } from './contexts/PlayerContext'
import s from './Layout.module.css'

export default function Layout() {
  const { player, tournament, signOut } = usePlayerContext()
  const [open, setOpen] = useState(false)

  const meHref = player ? `/players/${player.id}` : '/'

  function close() { setOpen(false) }

  return (
    <div className={s.shell}>
      <header className={s.header}>
        <Link to="/" className={s.headerLogo} onClick={close}>
          <img src="/tiff-logo.png" alt="The Tiff" />
        </Link>
        <div className={s.headerRight}>
          {tournament?.status === 'active' && (
            <div className={s.livePill}>
              <div className={s.liveDot} />
              Live
            </div>
          )}
          <button className={s.hamburger} onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      {open && <div className={s.backdrop} onClick={close} />}

      <div className={`${s.drawer} ${open ? s.drawerOpen : ''}`}>
        <nav className={s.drawerNav}>
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

      <nav className={s.nav}>
        <NavLink to="/" end className={({ isActive }) => `${s.navTab} ${isActive ? s.navTabActive : ''}`}>
          <span className={s.navIconWrap}><Home size={22} strokeWidth={1.75} /></span>
          <span className={s.navLabel}>Home</span>
        </NavLink>
        <NavLink to="/players" className={({ isActive }) => `${s.navTab} ${isActive ? s.navTabActive : ''}`}>
          <span className={s.navIconWrap}><Users size={22} strokeWidth={1.75} /></span>
          <span className={s.navLabel}>Players</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${s.navTab} ${isActive ? s.navTabActive : ''}`}>
          <span className={s.navIconWrap}><Trophy size={22} strokeWidth={1.75} /></span>
          <span className={s.navLabel}>History</span>
        </NavLink>
        <NavLink to={meHref} className={({ isActive }) => `${s.navTab} ${isActive ? s.navTabActive : ''}`}>
          <span className={s.navIconWrap}><User size={22} strokeWidth={1.75} /></span>
          <span className={s.navLabel}>Me</span>
        </NavLink>
      </nav>
    </div>
  )
}
