import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { usePlayer } from '../../hooks/usePlayer'
import s from './PlayerProfile.module.css'

function vsParStr(netTotal, roundsPlayed) {
  if (netTotal == null || roundsPlayed == null) return '—'
  const diff = Math.round(Number(netTotal) - roundsPlayed * 72)
  if (diff === 0) return 'E'
  return diff > 0 ? `+${diff}` : String(diff)
}

function vsParClass(netTotal, roundsPlayed, styles) {
  if (netTotal == null || roundsPlayed == null) return ''
  const diff = Math.round(Number(netTotal) - roundsPlayed * 72)
  return diff < 0 ? styles.under : diff > 0 ? styles.over : ''
}

function ordinal(n) {
  if (n == null) return 'DNF'
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

export default function PlayerProfile() {
  const { id }            = useParams()
  const { data, loading } = usePlayer(id)

  const derived = useMemo(() => {
    if (!data) return null
    const { results, rounds, hcps } = data

    const wins  = results.filter(r => r.position === 1).length
    const trips = results.length
    const best  = results.reduce((b, r) => (r.position != null && (b == null || r.position < b) ? r.position : b), null)

    const totalGross = rounds.reduce((sum, r) => sum + r.gross_total, 0)
    const avgGross   = rounds.length > 0 ? (totalGross / rounds.length).toFixed(1) : null

    const maxYear    = hcps.length > 0 ? Math.max(...hcps.map(h => h.year)) : null
    const currentHcp = hcps.find(h => h.year === maxYear)

    const roundsByTournament = {}
    rounds.forEach(r => {
      const year = r.tournament_rounds?.tournaments?.year
      if (!year) return
      if (!roundsByTournament[year]) roundsByTournament[year] = []
      roundsByTournament[year].push(r)
    })

    return { wins, trips, best, avgGross, currentHcp, roundsByTournament }
  }, [data])

  if (loading) return <div className={s.loading}>Loading…</div>
  if (!data?.player) return <div className={s.loading}>Player not found</div>

  const { player, results, hcps } = data
  const { wins, trips, best, avgGross, currentHcp, roundsByTournament } = derived

  const resultByYear = {}
  results.forEach(r => {
    const year = r.tournaments?.year
    if (year) resultByYear[year] = r
  })

  const allYears = [...new Set([
    ...results.map(r => r.tournaments?.year).filter(Boolean),
    ...Object.keys(roundsByTournament).map(Number),
  ])].sort((a, b) => b - a)

  return (
    <div>
      {/* Hero */}
      <div className={s.hero}>
        <div className={s.heroName}>{player.full_name ?? player.name}</div>
        <div className={s.chips}>
          {currentHcp && (
            <span className={`${s.chip} ${s.chipHcp}`}>
              Tiff HCP {currentHcp.tiff_handicap}
            </span>
          )}
          {player.ghin && (
            <span className={`${s.chip} ${s.chipGhin}`}>GHIN {player.ghin}</span>
          )}
          <span className={`${s.chip} ${s.chipTrips}`}>{trips} trip{trips !== 1 ? 's' : ''}</span>
          {wins > 0 && (
            <span className={`${s.chip} ${s.chipChamp}`}>🏆 {wins}× champ</span>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statVal}>{avgGross ?? '—'}</div>
          <div className={s.statLbl}>Avg Gross / Rd</div>
        </div>
        <div className={s.stat}>
          <div className={s.statVal}>{best != null ? ordinal(best) : '—'}</div>
          <div className={s.statLbl}>Best Finish</div>
        </div>
        <div className={s.stat}>
          <div className={s.statVal}>{wins}</div>
          <div className={s.statLbl}>{wins === 1 ? 'Title' : 'Titles'}</div>
        </div>
      </div>

      {/* Year-by-year cards */}
      <div className={s.history}>
        {allYears.length === 0 && (
          <div className={s.empty}>No tournament history</div>
        )}
        {allYears.map(year => {
          const result = resultByYear[year]
          const rds    = roundsByTournament[year] ?? []
          const loc    = result?.tournaments?.location ?? ''
          const pos    = result?.position
          const isWin  = pos === 1

          const sorted = [...rds].sort((a, b) => {
            const da = a.tournament_rounds?.day_number ?? 0
            const db = b.tournament_rounds?.day_number ?? 0
            return da - db
          })

          const nvp    = vsParStr(result?.net_total, result?.rounds_played)
          const nvpCls = result ? vsParClass(result.net_total, result.rounds_played, s) : ''

          return (
            <div key={year} className={s.yearCard}>
              <div className={s.ycHeader}>
                <div>
                  <div className={s.ycYear}>{year}</div>
                  {loc && <div className={s.ycLoc}>{loc}</div>}
                </div>
                {result && (
                  <div className={`${s.ycPos} ${isWin ? s.win : ''}`}>
                    {isWin ? '🏆 Champion' : result.dnf ? 'DNF' : ordinal(pos)}
                  </div>
                )}
              </div>

              {result && !result.dnf && (
                <div className={s.ycStats}>
                  <div className={s.ycStat}>
                    <div className={s.ycStatVal}>{result.playing_handicap ?? '—'}</div>
                    <div className={s.ycStatLbl}>HCP</div>
                  </div>
                  <div className={s.ycStat}>
                    <div className={s.ycStatVal}>{result.gross_total ?? '—'}</div>
                    <div className={s.ycStatLbl}>Gross</div>
                  </div>
                  <div className={s.ycStat}>
                    <div className={`${s.ycStatVal} ${nvpCls}`}>{nvp}</div>
                    <div className={s.ycStatLbl}>vs Par</div>
                  </div>
                </div>
              )}

              {sorted.length > 0 && (
                <div className={s.ycRounds}>
                  {sorted.map((r, i) => {
                    const course = r.tournament_rounds?.courses
                    return (
                      <div key={i} className={`${s.ycRound} ${i % 2 === 1 ? s.alt : ''}`}>
                        <div className={s.ycCourse}>
                          {course?.short_name ?? course?.name ?? `Round ${r.tournament_rounds?.day_number ?? i + 1}`}
                        </div>
                        <div className={s.ycGross}>{r.gross_total}</div>
                        {r.differential != null && (
                          <div className={s.ycDiff}>{r.differential}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
