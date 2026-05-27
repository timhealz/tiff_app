import { Link } from 'react-router-dom'
import { initials, fmtAvgVsPar } from '../../lib/scoring'
import s from './shared.module.css'

/**
 * Player row, two variants.
 *
 * variant="avatar"   — circle avatar + name + HCP (horizontal scroll on Home)
 * variant="list-row" — full row with avatar, name+sub, HCP chip, W, Avg
 *
 * `player` must include: id, name, full_name, plus optional hcp, wins, trips, avgVsPar, isChampion
 */
export default function PlayerRow({ player, variant = 'list-row', alt = false }) {
  if (!player) return null

  if (variant === 'avatar') {
    return (
      <Link to={`/players/${player.id}`} className={s.prFieldCard}>
        <div className={`${s.prFieldAvatar} ${player.isChampion ? s.prAvatarChamp : ''}`}>
          {initials(player.name || player.full_name)}
        </div>
        <div className={s.prFieldName}>
          {player.full_name ?? player.name ?? '?'}
        </div>
        {player.hcp?.tiff_handicap != null && (
          <div className={s.prFieldHcp}>HCP {player.hcp.tiff_handicap}</div>
        )}
      </Link>
    )
  }

  // list-row variant
  const hcp = player.hcp
  const tierClass =
    hcp?.tier === 'established' ? s.t1 :
    hcp?.tier === 'provisional' ? s.t2 :
    s.t3

  return (
    <Link to={`/players/${player.id}`} className={`${s.prRow} ${alt ? s.prRowAlt : ''}`}>
      <div className={s.prRowLeft}>
        <div className={`${s.prRowAvatar} ${player.isChampion ? s.prAvatarChamp : ''}`}>
          {initials(player.name || player.full_name)}
        </div>
        <div>
          <div className={s.prRowName}>{player.full_name ?? player.name}</div>
          <div className={s.prRowSub}>
            {player.trips ?? 0} trip{player.trips !== 1 ? 's' : ''}
            {player.isChampion ? ' · 🏆' : ''}
          </div>
        </div>
      </div>
      <div className={`${s.prHcpChip} ${tierClass}`}>
        {hcp ? hcp.tiff_handicap : '—'}
      </div>
      <div className={s.prCell}>{player.wins || '—'}</div>
      <div className={`${s.prCell} ${s.prAvg}`}>{fmtAvgVsPar(player.avgVsPar)}</div>
    </Link>
  )
}
