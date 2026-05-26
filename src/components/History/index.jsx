import { Link } from 'react-router-dom'
import { useTournamentHistory } from '../../hooks/useTournamentHistory'
import s from './History.module.css'

function vsParStr(net, rds) {
  if (net == null || rds == null) return null
  const diff = Math.round(Number(net) - rds * 72)
  if (diff === 0) return 'E'
  return diff > 0 ? `+${diff}` : String(diff)
}

export default function History() {
  const { data, loading } = useTournamentHistory()

  const tournaments = data?.tournaments ?? []
  const results     = data?.results     ?? []
  const allResults  = data?.allResults  ?? []
  const players     = data?.players     ?? []
  const histRounds  = data?.histRounds  ?? []

  // ── All-time records ──────────────────────────────────────────
  const winsByPlayer = {}
  allResults.forEach(r => {
    if (r.position === 1) winsByPlayer[r.player_id] = (winsByPlayer[r.player_id] ?? 0) + 1
  })
  const mostWins       = Math.max(0, ...Object.values(winsByPlayer))
  const mostWinsPlayer = players.find(p => winsByPlayer[p.id] === mostWins)

  const validGross  = histRounds.filter(r => r.gross_total > 0)
  const lowGrossEntry  = validGross.reduce((b, r) => (!b || r.gross_total < b.gross_total) ? r : b, null)
  const lowGrossPlayer = players.find(p => p.id === lowGrossEntry?.player_id)

  const validDiff   = histRounds.filter(r => r.differential != null)
  const lowDiffEntry   = validDiff.reduce((b, r) => (!b || r.differential < b.differential) ? r : b, null)
  const lowDiffPlayer  = players.find(p => p.id === lowDiffEntry?.player_id)

  const lowNetEntry = allResults.reduce((b, r) => {
    if (!r.net_total || !r.rounds_played) return b
    const avg = Number(r.net_total) / r.rounds_played
    return (!b || avg < b.avg) ? { ...r, avg } : b
  }, null)
  const lowNetPlayer = players.find(p => p.id === lowNetEntry?.player_id)

  // ── All-time standings ────────────────────────────────────────
  const standings = {}
  allResults.forEach(r => {
    if (!standings[r.player_id]) {
      standings[r.player_id] = { player_id: r.player_id, wins: 0, podiums: 0, netSum: 0, count: 0 }
    }
    const e = standings[r.player_id]
    if (r.position === 1) e.wins++
    if (r.position <= 3)  e.podiums++
    if (r.net_total) { e.netSum += Number(r.net_total); e.count++ }
  })
  const standingsArr = Object.values(standings)
    .map(e => ({ ...e, avgNet: e.count ? e.netSum / e.count : Infinity }))
    .sort((a, b) => b.wins - a.wins || b.podiums - a.podiums || a.avgNet - b.avgNet)

  // ── Championship cards ────────────────────────────────────────
  const champByTournament = {}
  results.forEach(r => {
    if (r.position === 1 && !champByTournament[r.tournament_id]) {
      champByTournament[r.tournament_id] = r
    }
  })

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.pageTitle}>Tournament History</div>
        <div className={s.pageSub}>{tournaments.length} completed trips</div>
      </div>

      {/* All-Time Records */}
      <div className={s.sectionHdr}>
        <span className={s.sectionTitle}>All-Time Records</span>
      </div>
      <div className={s.alltimeGrid}>
        <div className={s.atBox}>
          <div className={`${s.atVal} ${s.gold}`}>{mostWins || '—'}</div>
          <div className={s.atLbl}>Most Championships</div>
          {mostWinsPlayer && <Link to={`/players/${mostWinsPlayer.id}`} className={s.atDetail}>{mostWinsPlayer.name}</Link>}
        </div>
        <div className={`${s.atBox} ${s.dk}`}>
          <div className={`${s.atVal} ${s.green}`}>{lowGrossEntry ? lowGrossEntry.gross_total : '—'}</div>
          <div className={s.atLbl}>Low Gross Round</div>
          {lowGrossPlayer && <Link to={`/players/${lowGrossPlayer.id}`} className={s.atDetail}>{lowGrossPlayer.name}</Link>}
        </div>
        <div className={`${s.atBox} ${s.dk}`}>
          <div className={`${s.atVal} ${s.green}`}>{lowNetEntry ? Math.round(lowNetEntry.avg) : '—'}</div>
          <div className={s.atLbl}>Low Net (avg/rd)</div>
          {lowNetPlayer && <Link to={`/players/${lowNetPlayer.id}`} className={s.atDetail}>{lowNetPlayer.name}</Link>}
        </div>
        <div className={s.atBox}>
          <div className={`${s.atVal} ${s.green}`}>{lowDiffEntry ? lowDiffEntry.differential : '—'}</div>
          <div className={s.atLbl}>Low Differential</div>
          {lowDiffPlayer && <Link to={`/players/${lowDiffPlayer.id}`} className={s.atDetail}>{lowDiffPlayer.name}</Link>}
        </div>
      </div>

      {/* All-Time Standings */}
      <div className={s.sectionHdr}>
        <span className={s.sectionTitle}>All-Time Standings</span>
      </div>
      <div className={s.alltimeLb}>
        <div className={s.atlbThead}>
          <div className={s.atlbTh}>#</div>
          <div className={s.atlbTh}>Player</div>
          <div className={s.atlbTh}>W</div>
          <div className={s.atlbTh}>Pod</div>
          <div className={s.atlbTh}>Avg</div>
        </div>
        {loading ? null : standingsArr.map((entry, i) => {
          const player = players.find(p => p.id === entry.player_id)
          if (!player) return null
          return (
            <Link
              key={entry.player_id}
              to={`/players/${entry.player_id}`}
              className={`${s.atlbRow} ${i % 2 === 1 ? s.alt : ''}`}
            >
              <div className={`${s.atlbPos} ${i === 0 ? s.p1 : ''}`}>{i + 1}</div>
              <div className={s.atlbName}>{player.full_name ?? player.name}</div>
              <div className={`${s.atlbCell} ${s.wins}`}>{entry.wins}</div>
              <div className={s.atlbCell}>{entry.podiums}</div>
              <div className={s.atlbCell}>{entry.count > 0 ? Math.round(entry.avgNet) : '—'}</div>
            </Link>
          )
        })}
      </div>

      {/* Championships */}
      <div className={s.sectionHdr}>
        <span className={s.sectionTitle}>Championships</span>
        <span className={s.sectionSub}>{tournaments.length} year{tournaments.length !== 1 ? 's' : ''}</span>
      </div>
      {loading ? (
        <div className={s.empty}>Loading…</div>
      ) : tournaments.length === 0 ? (
        <div className={s.empty}>No completed tournaments</div>
      ) : (
        <div className={s.cards}>
          {tournaments.map(t => {
            const champ = champByTournament[t.id]
            const champPlayer = champ?.players
            const score = vsParStr(champ?.net_total, champ?.rounds_played)
            return (
              <Link key={t.id} to={`/history/${t.year}`} className={s.card}>
                <div className={s.cardTop}>
                  <div>
                    <div className={s.cardYear}>Tiff {t.year}</div>
                    {t.name && <div className={s.cardName}>{t.name}</div>}
                  </div>
                  <div className={s.cardLocation}>{t.location}</div>
                </div>
                <div className={s.cardBottom}>
                  <div>
                    <div className={s.champLabel}>Champion</div>
                    <div className={s.champName}>
                      {champPlayer ? (champPlayer.full_name ?? champPlayer.name) : '—'}
                    </div>
                  </div>
                  {score && <div className={s.champScore}>{score} vs par</div>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
