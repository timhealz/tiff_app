import { Link } from 'react-router-dom'
import { vsParStr } from '../../lib/scoring'
import s from './shared.module.css'

/**
 * Gold-tinted champion banner. Used under the hero on complete tournaments.
 *
 * Accepts a results row (or any object with players/net_total/rounds_played).
 */
export default function ChampionBanner({ champion }) {
  if (!champion) return null
  const name = champion.players?.full_name ?? champion.players?.name ?? '—'
  const score = vsParStr(champion.net_total, champion.rounds_played)
  const inner = (
    <>
      <div className={s.champBannerTrophy}>🏆</div>
      <div>
        <div className={s.champBannerLabel}>Champion</div>
        <div className={s.champBannerName}>{name}</div>
        {champion.net_total != null && (
          <div className={s.champBannerScore}>
            {champion.net_total} net{score ? ` · ${score} vs par` : ''}
          </div>
        )}
      </div>
    </>
  )
  return champion.player_id ? (
    <Link to={`/players/${champion.player_id}`} className={s.champBanner}>{inner}</Link>
  ) : (
    <div className={s.champBanner}>{inner}</div>
  )
}
