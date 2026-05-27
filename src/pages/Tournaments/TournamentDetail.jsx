import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTournament } from '../../hooks/useTournament'
import TournamentHero from '../../components/shared/TournamentHero'
import ChampionBanner from '../../components/shared/ChampionBanner'
import FinalStandings from '../../components/shared/FinalStandings'
import SectionHeader from '../../components/shared/SectionHeader'
import s from './Tournaments.module.css'

export default function TournamentDetail() {
  const { year } = useParams()
  const { data, loading } = useTournament(year)

  if (loading) {
    return <div className={s.page}><div className={s.empty}>Loading…</div></div>
  }
  if (!data?.tournament) {
    return (
      <div className={s.page}>
        <div className={s.backBar}>
          <Link to="/tournaments" className={s.backLink}>← Tournaments</Link>
        </div>
        <div className={s.empty}>Tournament not found</div>
      </div>
    )
  }

  const { tournament, results, rounds } = data
  const state    = tournament.status
  const champion = results.find(r => r.position === 1 && !r.dnf)
  const hasResults = results.length > 0 && state !== 'upcoming'

  return (
    <div className={s.page}>
      <div className={s.backBar}>
        <Link to="/tournaments" className={s.backLink}>← Tournaments</Link>
      </div>

      <TournamentHero tournament={tournament} state={state} />

      {state === 'complete' && champion && (
        <ChampionBanner champion={champion} />
      )}

      {state === 'active' && (
        <div className={s.placeholder}>
          <div className={s.placeholderIco}>🔴</div>
          <div className={s.placeholderTitle}>Live tournament in progress</div>
          <div className={s.placeholderBody}>
            Multi-game leaderboard is coming soon.
            For now, see the live view on <Link to="/" className={s.placeholderLink}>Home</Link>.
          </div>
        </div>
      )}

      {state === 'upcoming' && (
        <div className={s.placeholder}>
          <div className={s.placeholderIco}>📅</div>
          <div className={s.placeholderTitle}>
            {tournament.name ?? `The ${tournament.year} Tiff`}
          </div>
          <div className={s.placeholderBody}>
            {tournament.date
              ? `Starts ${new Date(tournament.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
              : 'Date TBD.'}
            <br />Pairings and starting handicaps will appear here before the trip.
          </div>
        </div>
      )}

      {hasResults && (
        <>
          <SectionHeader title="Final Standings" subtitle="Net stroke play" />
          <FinalStandings results={results} mode={state === 'active' ? 'live' : 'final'} />
        </>
      )}

      {state === 'complete' && rounds.length > 0 && (
        <RoundByRoundGrid results={results} rounds={rounds} />
      )}
    </div>
  )
}

function RoundByRoundGrid({ results, rounds }) {
  const [mode, setMode]       = useState('gross')      // 'gross' | 'net'
  const [display, setDisplay] = useState('total')      // 'total' | 'vspar'
  const finishers = results.filter(r => !r.dnf)
  const days = [...new Set(rounds.map(r => r.tournament_rounds?.day_number).filter(Boolean))].sort()
  if (days.length === 0) return null

  const roundsByPlayer = {}
  rounds.forEach(r => {
    const day = r.tournament_rounds?.day_number
    if (!day) return
    if (!roundsByPlayer[r.player_id]) roundsByPlayer[r.player_id] = {}
    roundsByPlayer[r.player_id][day] = r.gross_total
  })

  function fmtRelative(n) {
    if (n === 0) return 'E'
    return n > 0 ? `+${n}` : String(n)
  }

  // Per-round net is an approximation: historical tournaments stored only
  // totals (gross_total, net_total), not per-round net. We distribute the
  // total reduction (gross_total - net_total) evenly across rounds. Drift
  // from rounding is absorbed into the last round so cells always sum to
  // the displayed total. Whenever live scoring exists for a tournament,
  // this should be replaced with true per-round net from the scores view.
  const netByPlayer = {}
  finishers.forEach(r => {
    const grossTotal = Number(r.gross_total)
    const netTotal   = Number(r.net_total)
    if (!isFinite(grossTotal) || !isFinite(netTotal)) return
    const rds = r.rounds_played ?? days.length
    const reductionPerRound = (grossTotal - netTotal) / rds
    const cells = {}
    let cumulative = 0
    days.forEach((d, i) => {
      const gross = roundsByPlayer[r.player_id]?.[d]
      if (gross == null) { cells[d] = null; return }
      if (i < days.length - 1) {
        const v = Math.round(gross - reductionPerRound)
        cells[d] = v
        cumulative += v
      } else {
        // Last round absorbs any rounding drift so cells sum exactly to net_total
        cells[d] = Math.round(netTotal) - cumulative
      }
    })
    netByPlayer[r.player_id] = cells
  })

  function cellValue(playerResult, day) {
    const gross = roundsByPlayer[playerResult.player_id]?.[day]
    if (gross == null) return '—'
    const raw = mode === 'gross'
      ? gross
      : (netByPlayer[playerResult.player_id]?.[day] ?? null)
    if (raw == null) return '—'
    return display === 'vspar' ? fmtRelative(raw - 72) : raw
  }

  // Total column. Uses real totals from tournament_results.
  function totalValue(playerResult) {
    const rawTotal = mode === 'gross'
      ? playerResult.gross_total
      : (playerResult.net_total != null ? Math.round(Number(playerResult.net_total)) : null)
    if (rawTotal == null) return '—'
    if (display === 'vspar') {
      const rds = playerResult.rounds_played ?? days.length
      return fmtRelative(rawTotal - rds * 72)
    }
    return rawTotal
  }

  return (
    <div className={s.roundGridWrap}>
      <div className={s.roundGridHeader}>
        <div className={s.roundGridTitle}>Round-by-round</div>
        <div className={s.modeToggles}>
          <div className={s.modeToggle}>
            <button
              className={`${s.modeBtn} ${mode === 'gross' ? s.modeBtnActive : ''}`}
              onClick={() => setMode('gross')}
            >Gross</button>
            <button
              className={`${s.modeBtn} ${mode === 'net' ? s.modeBtnActive : ''}`}
              onClick={() => setMode('net')}
            >Net</button>
          </div>
          <div className={s.modeToggle}>
            <button
              className={`${s.modeBtn} ${display === 'total' ? s.modeBtnActive : ''}`}
              onClick={() => setDisplay('total')}
            >Total</button>
            <button
              className={`${s.modeBtn} ${display === 'vspar' ? s.modeBtnActive : ''}`}
              onClick={() => setDisplay('vspar')}
            >vs Par</button>
          </div>
        </div>
      </div>
      <div
        className={s.roundGrid}
        style={{ gridTemplateColumns: `1fr ${days.map(() => '40px').join(' ')} 50px` }}
      >
        <div className={s.rgHdr}>Player</div>
        {days.map(d => <div key={d} className={s.rgHdr}>D{d}</div>)}
        <div className={s.rgHdr}>{display === 'vspar' ? 'vs Par' : (mode === 'net' ? 'Net' : 'Total')}</div>

        {finishers.map((r, i) => {
          const name = r.players?.full_name ?? r.players?.name ?? '—'
          const cls  = i % 2 === 1 ? s.rgCellAlt : ''
          return (
            <div key={r.player_id} style={{ display: 'contents' }}>
              <div className={`${s.rgCell} ${cls}`}>{name}</div>
              {days.map(d => (
                <div key={d} className={`${s.rgCell} ${cls}`}>
                  {cellValue(r, d)}
                </div>
              ))}
              <div className={`${s.rgCell} ${s.rgCellTotal} ${cls}`}>{totalValue(r)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
