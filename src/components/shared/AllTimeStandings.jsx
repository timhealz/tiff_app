import { Link } from 'react-router-dom'
import { fmtAvgVsPar } from '../../lib/scoring'
import s from './shared.module.css'

/**
 * All-time standings table. Top-N for previews; no limit for canonical Records page.
 *
 * `standings` shape (from useAllTimeStandings):
 *   { player_id, player, wins, podiums, trips, avgVsPar }
 *
 * @param {Object[]} standings
 * @param {number}   [limit]         — truncate to first N
 * @param {string}   [seeMoreTo]     — if provided, renders "See full hall of fame →" row
 * @param {boolean}  [showMeta=true] — show "N trips · avg net X" sub-line
 */
export default function AllTimeStandings({ standings, limit, seeMoreTo, showMeta = true }) {
  if (!standings) return null
  const rows = limit ? standings.slice(0, limit) : standings

  return (
    <div className={s.standings}>
      <div className={s.standingsThead}>
        <div className={s.standingsTh} />
        <div className={`${s.standingsTh} ${s.standingsThPlayer}`}>Player</div>
        <div className={s.standingsTh}>W</div>
        <div className={s.standingsTh}>Pod</div>
        <div className={s.standingsTh}>Avg</div>
      </div>

      {rows.map((entry, i) => {
        const player = entry.player
        if (!player) return null
        return (
          <Link
            key={entry.player_id}
            to={`/players/${entry.player_id}`}
            className={`${s.standingsRow} ${i % 2 === 1 ? s.standingsRowAlt : ''}`}
          >
            <div className={`${s.standingsPos} ${i === 0 ? s.standingsPosFirst : ''}`}>
              {i === 0 ? '🏆' : i + 1}
            </div>
            <div>
              <div className={s.standingsName}>{player.full_name ?? player.name}</div>
              {showMeta && (
                <div className={s.standingsMeta}>
                  {entry.trips} trip{entry.trips !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className={`${s.standingsCell} ${s.standingsCellWins}`}>{entry.wins}</div>
            <div className={s.standingsCell}>{entry.podiums}</div>
            <div className={s.standingsCell}>{fmtAvgVsPar(entry.avgVsPar)}</div>
          </Link>
        )
      })}

      {seeMoreTo && (
        <Link to={seeMoreTo} className={s.seeMoreRow}>
          <span className={s.seeMoreLink}>See full hall of fame →</span>
        </Link>
      )}
    </div>
  )
}
