import s from './shared.module.css'

/**
 * Tournament page hero block. Year + name + location + state badge.
 *
 * state: 'complete' | 'active' | 'upcoming'
 */
export default function TournamentHero({ tournament, state }) {
  if (!tournament) return null

  const stateBadge = {
    complete: { cls: s.stateBadgeComplete, label: '✓ Complete' },
    active:   { cls: s.stateBadgeActive,   label: '🔴 Live' },
    upcoming: { cls: s.stateBadgeUpcoming, label: 'Upcoming' },
  }[state] ?? { cls: '', label: '' }

  return (
    <div className={s.tourneyHero}>
      <div className={s.tourneyHeroRow}>
        <div>
          <div className={s.tourneyYearBig}>{tournament.year}</div>
          {tournament.name && (
            <div className={s.tourneyNameSub}>{tournament.name}</div>
          )}
          <div className={s.tourneyLocSub}>📍 {tournament.location}</div>
        </div>
        {stateBadge.label && (
          <div>
            <span className={`${s.stateBadge} ${stateBadge.cls}`}>
              {stateBadge.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
