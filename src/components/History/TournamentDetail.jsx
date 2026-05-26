import { useParams, Link } from 'react-router-dom'
import { useTournamentDetail } from '../../hooks/useTournamentHistory'
import s from './History.module.css'

function posClass(pos) {
  if (pos === 1) return s.gold
  if (pos === 2) return s.silver
  if (pos === 3) return s.bronze
  return ''
}

function posLabel(pos) {
  if (pos == null) return 'DNF'
  return pos
}

function vsParStr(net, rds) {
  if (net == null || rds == null) return '—'
  const diff = Math.round(Number(net) - rds * 72)
  if (diff === 0) return 'E'
  return diff > 0 ? `+${diff}` : String(diff)
}

export default function TournamentDetail() {
  const { year }      = useParams()
  const { data, loading } = useTournamentDetail(year)

  if (loading) {
    return (
      <div className={s.detail}>
        <div className={s.empty}>Loading…</div>
      </div>
    )
  }

  if (!data?.tournament) {
    return (
      <div className={s.detail}>
        <div className={s.empty}>Tournament not found</div>
      </div>
    )
  }

  const { tournament, results } = data
  const finishers = results.filter(r => !r.dnf)
  const dnfs      = results.filter(r => r.dnf)

  return (
    <div className={s.detail}>
      <div className={s.detailHeader}>
        <div className={s.detailYear}>
          Tiff <span>{tournament.year}</span>
        </div>
        <div className={s.detailLocation}>{tournament.location}</div>
      </div>

      <div className={s.standingsTable}>
        <div className={s.thead}>
          <div className={s.th}>#</div>
          <div className={s.th}>Player</div>
          <div className={s.th}>HCP</div>
          <div className={s.th}>Gross</div>
          <div className={s.th}>vs Par</div>
        </div>

        {finishers.map(r => {
          const name = r.players?.full_name ?? r.players?.name ?? '—'
          return (
            <div key={r.player_id} className={s.row}>
              <div className={`${s.pos} ${posClass(r.position)}`}>
                {posLabel(r.position)}
              </div>
              <Link to={`/players/${r.player_id}`} className={s.playerName}>{name}</Link>
              <div className={s.cell}>{r.playing_handicap ?? '—'}</div>
              <div className={s.cell}>{r.gross_total ?? '—'}</div>
              <div className={`${s.cell} ${s.net}`}>{vsParStr(r.net_total, r.rounds_played)}</div>
            </div>
          )
        })}

        {dnfs.length > 0 && (
          <>
            <div className={s.dnfSection}>Did not finish</div>
            {dnfs.map(r => {
              const name = r.players?.full_name ?? r.players?.name ?? '—'
              return (
                <div key={r.player_id} className={`${s.row} ${s.dnfRow}`}>
                  <div className={s.pos}>—</div>
                  <div className={s.playerName}>
                    <Link to={`/players/${r.player_id}`} className={s.playerName}>{name}</Link>
                    <span className={s.dnfBadge}>DNF</span>
                  </div>
                  <div className={s.cell}>{r.playing_handicap ?? '—'}</div>
                  <div className={s.cell}>—</div>
                  <div className={s.cell}>—</div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
