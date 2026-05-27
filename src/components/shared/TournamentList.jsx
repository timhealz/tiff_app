import TournamentCard from './TournamentCard'
import s from './shared.module.css'

/**
 * Vertical list of tournaments. Active tournament (if any) is pinned to top.
 */
export default function TournamentList({ tournaments, limit }) {
  if (!tournaments) return null
  const active   = tournaments.find(t => t.status === 'active')
  const others   = tournaments.filter(t => t.status !== 'active')
  const limited  = limit ? others.slice(0, limit) : others
  const ordered  = active ? [active, ...limited] : limited

  return (
    <div className={s.tList}>
      {ordered.map(t => (
        <TournamentCard key={t.id} tournament={t} variant="row" />
      ))}
    </div>
  )
}
