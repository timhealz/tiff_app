import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { Menu, X, Settings } from 'lucide-react'
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
        <nav className={s.tabs}>
          <NavLink to="/" end className={({ isActive }) => `${s.tab} ${isActive ? s.tabActive : ''}`}>Home</NavLink>
          <NavLink to="/players" className={({ isActive }) => `${s.tab} ${isActive ? s.tabActive : ''}`}>Players</NavLink>
          <NavLink to="/history" className={({ isActive }) => `${s.tab} ${isActive ? s.tabActive : ''}`}>History</NavLink>
          <NavLink to={meHref} className={({ isActive }) => `${s.tab} ${isActive ? s.tabActive : ''}`}>Me</NavLink>
        </nav>
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
    </div>
  )
}
