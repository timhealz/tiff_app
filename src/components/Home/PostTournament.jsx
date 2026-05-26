import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHome } from '../../hooks/useHome'
import { supabase } from '../../supabaseClient'
import s from './Home.module.css'

function vsParStr(n) {
  if (n == null) return '—'
  if (n === 0)   return 'E'
  return n > 0 ? `+${n}` : `${n}`
}

export default function PostTournament({ tournament }) {
  const { data: homeData, loading: homeLoading } = useHome()
  const [hcpData, setHcpData] = useState({ snaps: [], nextHcps: [] })

  useEffect(() => {
    if (!tournament?.id) return
    Promise.all([
      supabase
        .from('handicap_snapshots')
        .select('player_id, playing_handicap, method')
        .eq('tournament_id', tournament.id),
      supabase
        .from('v_tiff_handicap_by_year')
        .select('player_id, tiff_handicap, tier')
        .eq('year', tournament.year + 1),
    ]).then(([snap, nextHcp]) => {
      setHcpData({ snaps: snap.data ?? [], nextHcps: nextHcp.data ?? [] })
    })
  }, [tournament?.id, tournament?.year])

  const results = (homeData?.results ?? []).filter(r => r.tournament_id === tournament.id)
  const players = homeData?.players ?? []
  const histRounds = homeData?.histRounds ?? []

  const champion = results.find(r => r.position === 1)
  const champPlayer = players.find(p => p.id === champion?.player_id)

  // net vs par: net_total - (rounds_played * 72)
  function netVsPar(r) {
    if (!r.net_total || !r.rounds_played) return null
    return Math.round(Number(r.net_total) - (r.rounds_played * 72))
  }

  // Week highlights
  // Low gross (per-round avg from tournament_results)
  const lowGrossEntry = results.reduce((best, r) => {
    if (!r.gross_total || !r.rounds_played) return best
    const avg = r.gross_total / r.rounds_played
    return (!best || avg < best.avg) ? { ...r, avg } : best
  }, null)
  const lowGrossPlayer = players.find(p => p.id === lowGrossEntry?.player_id)

  // Low net (best avg net per round)
  const lowNetEntry = results.reduce((best, r) => {
    if (!r.net_total || !r.rounds_played) return best
    const avg = Number(r.net_total) / r.rounds_played
    return (!best || avg < best.avgNet) ? { ...r, avgNet: avg } : best
  }, null)
  const lowNetPlayer = players.find(p => p.id === lowNetEntry?.player_id)

  // Most improved: biggest HCP drop (snap.playing_handicap → nextHcp)
  const snapByPlayer = Object.fromEntries(hcpData.snaps.map(s => [s.player_id, s]))
  const nextHcpByPlayer = Object.fromEntries(hcpData.nextHcps.map(h => [h.player_id, h]))
  const hcpDrops = hcpData.snaps
    .filter(snap => nextHcpByPlayer[snap.player_id])
    .map(snap => {
      const next = nextHcpByPlayer[snap.player_id]
      return { player_id: snap.player_id, drop: snap.playing_handicap - next.tiff_handicap }
    })
    .sort((a, b) => b.drop - a.drop)
  const biggestDropEntry = hcpDrops[0]
  const biggestDropPlayer = players.find(p => p.id === biggestDropEntry?.player_id)

  // Low differential (from histRounds filtered — not per-tournament, show all-time)
  const validDiff = histRounds.filter(r => r.differential != null)
  const lowDiffEntry = validDiff.reduce((best, r) => (!best || r.differential < best.differential) ? r : best, null)
  const lowDiffPlayer = players.find(p => p.id === lowDiffEntry?.player_id)

  // HCP movement table (only if snaps exist)
  const hcpMoves = hcpData.snaps
    .map(snap => {
      const next = nextHcpByPlayer[snap.player_id]
      const player = players.find(p => p.id === snap.player_id)
      if (!player) return null
      return { player, was: Number(snap.playing_handicap), now: next ? Number(next.tiff_handicap) : null }
    })
    .filter(Boolean)
    .sort((a, b) => (a.now ?? Infinity) - (b.now ?? Infinity))

  async function handleShare() {
    const standingsText = results
      .map(r => {
        const p = players.find(pl => pl.id === r.player_id)
        return `${r.position}. ${p?.name ?? '?'} — ${Math.round(r.net_total ?? 0)} net`
      })
      .join('\n')

    const text = [
      `The Tiff ${tournament.year} — ${tournament.location}`,
      `🏆 Champion: ${champPlayer?.full_name ?? '?'}`,
      '',
      'Final Standings:',
      standingsText,
    ].join('\n')

    if (navigator.share) {
      try { await navigator.share({ title: `The Tiff ${tournament.year}`, text }) }
      catch { /* user dismissed */ }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Results copied to clipboard')
    }
  }

  return (
    <div>
      {/* Champion hero */}
      <div className={s.champHero}>
        <div className={s.champTrophy}>🏆</div>
        <div className={s.champEyebrow}>{tournament.year} Champion · {tournament.location}</div>
        {champPlayer
          ? <Link to={`/players/${champPlayer.id}`} className={s.champName}>{champPlayer.full_name}</Link>
          : <div className={s.champName}>—</div>
        }
        {champion && (
          <div className={s.champScore}>
            <strong>{Math.round(champion.net_total ?? 0)} net</strong>
            {' '}({vsParStr(netVsPar(champion))} vs par)
          </div>
        )}
      </div>

      {/* Final Standings */}
      <div className={s.sectionHdr}>
        <span className={s.sectionTitle}>Final Standings</span>
      </div>
      <div className={s.finalStandings}>
        <div className={s.fsThead}>
          <div className={s.fsTh}>#</div>
          <div className={s.fsTh}>Player</div>
          <div className={s.fsTh}>Gross</div>
          <div className={s.fsTh}>vs Par</div>
        </div>
        {results.map((r, i) => {
          const p = players.find(pl => pl.id === r.player_id)
          const nvp = netVsPar(r)
          return (
            <div key={r.player_id} className={`${s.fsRow} ${r.position === 1 ? s.p1 : i % 2 === 1 ? s.alt : ''}`}>
              <div className={`${s.fsPos} ${r.position === 1 ? s.gold : ''}`}>{r.position}</div>
              <div>
                {p
                  ? <Link to={`/players/${p.id}`} className={s.fsName}>{p.name ?? p.full_name}</Link>
                  : <div className={s.fsName}>—</div>
                }
                <div className={s.fsHcp}>HCP {r.playing_handicap}</div>
              </div>
              <div className={s.fsCell}>{r.gross_total ?? '—'}</div>
              <div className={`${s.fsCell} ${nvp < 0 ? s.under : nvp > 0 ? s.over : ''}`}>{vsParStr(nvp)}</div>
            </div>
          )
        })}
      </div>

      {/* Week Highlights */}
      <div className={s.sectionHdr}>
        <span className={s.sectionTitle}>Week Highlights</span>
      </div>
      <div className={s.wkHighlights}>
        <div className={s.wkh}>
          <div className={s.wkhIco}>🏌️</div>
          <div className={s.wkhLbl}>Low Round (Gross)</div>
          <div className={`${s.wkhVal} ${s.gold}`}>{lowGrossEntry ? Math.round(lowGrossEntry.avg) : '—'}</div>
          {lowGrossPlayer && <Link to={`/players/${lowGrossPlayer.id}`} className={s.wkhDetail}>{lowGrossPlayer.name}</Link>}
        </div>
        <div className={`${s.wkh} ${s.dk}`}>
          <div className={s.wkhIco}>🎯</div>
          <div className={s.wkhLbl}>Low Round (Net)</div>
          <div className={`${s.wkhVal} ${s.good}`}>{lowNetEntry ? Math.round(lowNetEntry.avgNet) : '—'}</div>
          {lowNetPlayer && <Link to={`/players/${lowNetPlayer.id}`} className={s.wkhDetail}>{lowNetPlayer.name}</Link>}
        </div>
        <div className={`${s.wkh} ${s.dk}`}>
          <div className={s.wkhIco}>📉</div>
          <div className={s.wkhLbl}>Biggest HCP Drop</div>
          <div className={`${s.wkhVal} ${s.good}`}>
            {biggestDropEntry ? `−${biggestDropEntry.drop.toFixed(1)}` : '—'}
          </div>
          {biggestDropPlayer && <Link to={`/players/${biggestDropPlayer.id}`} className={s.wkhDetail}>{biggestDropPlayer.name}</Link>}
        </div>
        <div className={s.wkh}>
          <div className={s.wkhIco}>⛳</div>
          <div className={s.wkhLbl}>Low Differential</div>
          <div className={`${s.wkhVal} ${s.good}`}>{lowDiffEntry ? lowDiffEntry.differential : '—'}</div>
          {lowDiffPlayer && <Link to={`/players/${lowDiffPlayer.id}`} className={s.wkhDetail}>{lowDiffPlayer.name}</Link>}
        </div>
      </div>

      {/* HCP Movement */}
      {hcpMoves.length > 0 && (
        <>
          <div className={s.sectionHdr}>
            <span className={s.sectionTitle}>Tiff HCP Updates</span>
            <span className={s.sectionSub}>Takes effect {tournament.year + 1}</span>
          </div>
          <div className={s.hcpMoves}>
            <div className={s.hcpMovesLbl}>Playing handicap · before → after</div>
            {hcpMoves.map(({ player, was, now }) => {
              const delta = now != null ? now - was : null
              return (
                <div key={player.id} className={s.hmRow}>
                  <Link to={`/players/${player.id}`} className={s.hmName}>{player.name}</Link>
                  <div className={s.hmVal}>{was}</div>
                  <div className={s.hmArrow}>→</div>
                  <div className={s.hmNew}>{now != null ? now : '—'}</div>
                  <div className={`${s.hmDelta} ${delta != null && delta < 0 ? s.down : delta > 0 ? s.up : ''}`}>
                    {delta != null ? (delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Share */}
      <div className={s.shareBtnWrap}>
        <button className={s.shareBtn} onClick={handleShare}>
          Share Results
        </button>
      </div>
    </div>
  )
}
