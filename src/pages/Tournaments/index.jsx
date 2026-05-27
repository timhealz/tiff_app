import { useTournaments } from '../../hooks/useTournaments'
import TournamentList from '../../components/shared/TournamentList'
import s from './Tournaments.module.css'

export default function Tournaments() {
  const { data: tournaments, loading } = useTournaments()
  const all = tournaments ?? []
  const completedCount = all.filter(t => t.status === 'complete').length

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.pageTitle}>Tournaments</div>
        <div className={s.pageSub}>
          {completedCount} year{completedCount !== 1 ? 's' : ''} · all tournaments
        </div>
      </div>

      {loading ? (
        <div className={s.empty}>Loading…</div>
      ) : all.length === 0 ? (
        <div className={s.empty}>No tournaments yet</div>
      ) : (
        <TournamentList tournaments={all} />
      )}
    </div>
  )
}
