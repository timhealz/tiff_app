import { Link } from 'react-router-dom'
import { vsParStr } from '../../lib/scoring'
import s from './shared.module.css'

/**
 * Tournament preview card.
 *
 * variant="compact" — 130px wide, for horizontal scroll on Home.
 * variant="row"     — full-width row, for /tournaments list.
 */
export default function TournamentCard({ tournament, variant = 'compact' }) {
  const t = tournament
  if (!t) return null

  const champ      = t.champion
  const champName  = champ?.players?.full_name ?? champ?.players?.name ?? null
  const champScore = vsParStr(champ?.net_total, champ?.rounds_played)

  if (variant === 'compact') {
    return (
      <Link to={`/tournaments/${t.year}`} className={s.tcCompact}>
        <div className={s.tcCompactHeader}>
          <div className={s.tcCompactYear}>{t.year}</div>
          <div className={s.tcCompactLocation}>{t.location}</div>
        </div>
        <div className={s.tcCompactBody}>
          <div className={s.tcCompactChampLbl}>🏆 Champion</div>
          <div className={s.tcCompactChampName}>{champName ?? '—'}</div>
          {champScore && (
            <div className={s.tcCompactScore}>
              {champ?.net_total} net · <strong>{champScore}</strong>
            </div>
          )}
        </div>
      </Link>
    )
  }

  // row variant
  const isLive = t.status === 'active'
  const podium = t.podium ?? []
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return (
    <Link
      to={`/tournaments/${t.year}`}
      className={`${s.tcRow} ${isLive ? s.tcRowActive : ''}`}
    >
      <div className={`${s.tcRowYear} ${isLive ? s.tcRowYearActive : ''}`}>'{String(t.year).slice(-2)}</div>
      <div className={s.tcRowInfo}>
        <div className={s.tcRowLoc}>{t.location}</div>
        {t.name && <div className={s.tcRowMeta}>{t.name}</div>}
        {isLive ? (
          <div className={s.tcRowLive}>
            <span className={s.liveBadgeSmall}>
              <span className={s.liveDot} />Live
            </span>
          </div>
        ) : podium.length > 0 ? (
          <div className={s.tcRowPodium}>
            {podium.slice(0, 3).map(p => {
              const name = p.players?.full_name ?? p.players?.name ?? '—'
              const score = vsParStr(p.net_total, p.rounds_played)
              return (
                <div key={p.position} className={s.tcRowPodRow}>
                  <span className={s.tcRowPodMedal}>{medals[p.position] ?? p.position}</span>
                  <span className={`${s.tcRowPodName} ${p.position === 1 ? s.tcRowPodChamp : ''}`}>{name}</span>
                  {score && <span className={s.tcRowPodScore}>{score}</span>}
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
      <div className={s.tcRowRight}>
        <div className={s.tcRowArrow}>→</div>
      </div>
    </Link>
  )
}
