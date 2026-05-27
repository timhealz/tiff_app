import { Link } from 'react-router-dom'
import { vsParStr, vsParClass } from '../../lib/scoring'
import s from './shared.module.css'

/**
 * Final standings table for a single tournament.
 * mode='final' (default) shows static positions. mode='live' is reserved for
 * future multi-game leaderboard work and currently behaves identically.
 *
 * results: rows from tournament_results joined with players
 */
export default function FinalStandings({ results, mode = 'final' }) {
  if (!results) return null
  const finishers = results.filter(r => !r.dnf)
  const dnfs      = results.filter(r => r.dnf)

  return (
    <div className={s.fsTable}>
      <div className={s.fsThead}>
        <div className={s.fsTh} />
        <div className={`${s.fsTh} ${s.fsThPlayer}`}>Player</div>
        <div className={s.fsTh}>Net</div>
        <div className={s.fsTh}>+/−</div>
        <div className={s.fsTh}>Grs</div>
      </div>

      {finishers.map((r, i) => {
        const name = r.players?.full_name ?? r.players?.name ?? '—'
        const cls = vsParClass(r.net_total, r.rounds_played)
        return (
          <Link
            key={r.player_id}
            to={`/players/${r.player_id}`}
            className={`${s.fsRow} ${i % 2 === 1 ? s.fsRowAlt : ''} ${r.position === 1 ? s.fsRowFirst : ''}`}
          >
            <div className={`${s.fsPos} ${r.position === 1 ? s.fsPosGold : ''}`}>
              {r.position === 1 ? '🏆' : r.position}
            </div>
            <div>
              <div className={s.fsName}>{name}</div>
              {r.playing_handicap != null && (
                <div className={s.fsHcp}>HCP {r.playing_handicap}</div>
              )}
            </div>
            <div className={s.fsCell}>{r.net_total ?? '—'}</div>
            <div className={`${s.fsCell} ${cls === 'under' ? s.fsCellUnder : ''} ${cls === 'over' ? s.fsCellOver : ''}`}>
              {vsParStr(r.net_total, r.rounds_played) ?? '—'}
            </div>
            <div className={s.fsCell}>{r.gross_total ?? '—'}</div>
          </Link>
        )
      })}

      {dnfs.length > 0 && (
        <>
          <div className={s.fsDnfSection}>Did not finish</div>
          {dnfs.map(r => {
            const name = r.players?.full_name ?? r.players?.name ?? '—'
            return (
              <Link
                key={r.player_id}
                to={`/players/${r.player_id}`}
                className={`${s.fsRow} ${s.fsRowDnf}`}
              >
                <div className={s.fsPos}>—</div>
                <div>
                  <div className={s.fsName}>{name}</div>
                  <div className={s.fsHcp}>DNF</div>
                </div>
                <div className={s.fsCell}>—</div>
                <div className={s.fsCell}>—</div>
                <div className={s.fsCell}>—</div>
              </Link>
            )
          })}
        </>
      )}
    </div>
  )
}
