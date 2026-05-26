import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useHome } from '../../hooks/useHome'
import { supabase } from '../../supabaseClient'
import s from './Home.module.css'

function initials(str) {
  if (!str) return '?'
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function calcCountdown(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr)
  target.setHours(12, 0, 0, 0)
  const diff = target - Date.now()
  if (diff <= 0) return null
  return {
    days:  Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins:  Math.floor((diff % 3600000) / 60000),
    secs:  Math.floor((diff % 60000) / 1000),
  }
}

function pad(n) { return String(n).padStart(2, '0') }

export default function OffSeason({ upcoming }) {
  const { data, loading } = useHome()
  const [countdown, setCountdown] = useState(() => calcCountdown(upcoming?.date))
  const [fieldPlayers, setFieldPlayers] = useState(null)
  const [fieldOpen, setFieldOpen] = useState(false)

  useEffect(() => {
    if (!upcoming?.date) return
    const id = setInterval(() => setCountdown(calcCountdown(upcoming.date)), 1000)
    return () => clearInterval(id)
  }, [upcoming?.date])

  useEffect(() => {
    if (!upcoming?.id) return
    supabase
      .from('tournament_players')
      .select('players(id, name, full_name)')
      .eq('tournament_id', upcoming.id)
      .then(({ data: rows }) => {
        const found = (rows ?? []).map(r => r.players).filter(Boolean)
        if (found.length > 0) setFieldPlayers(found)
      })
  }, [upcoming?.id])

  // ── Derived data ──────────────────────────────────────────────
  const results              = data?.results ?? []
  const completedTournaments = data?.completedTournaments ?? []
  const players              = data?.players ?? []
  const allHcps              = data?.allHcps ?? []

  // Current HCPs: highest year per player
  const maxHcpYear = allHcps.reduce((m, r) => Math.max(m, r.year), 0)
  const currentHcps = allHcps.filter(r => r.year === maxHcpYear)
  const hcpByPlayer = Object.fromEntries(currentHcps.map(r => [r.player_id, r]))

  // Reigning champion: position=1 for the most recent completed tournament
  const mostRecentTournamentId = completedTournaments[0]?.id
  const champEntry = results.find(r => r.tournament_id === mostRecentTournamentId && r.position === 1)
  const reigningChampionId = champEntry?.player_id

  // Championship cards: top 3 per tournament
  const cardsByTournament = completedTournaments.map(t => {
    const top3 = results.filter(r => r.tournament_id === t.id && r.position <= 3)
    return { tournament: t, top3 }
  })

  return (
    <div>
      {/* Countdown hero */}
      <div className={s.countdownHero}>
        <div className={s.cdhTitle}>
          {(upcoming?.name ?? `${upcoming?.year ?? ''} Annual Tiff`).replace(/^the\s+/i, '')}
        </div>
        {upcoming?.location && (
          <div className={s.cdhLocation}>{upcoming.location}</div>
        )}
        <div className={s.cdhEyebrow}>Next Tiff in</div>
        {countdown ? (
          <div className={s.countdownDigits}>
            <div className={s.cdUnit}><div className={s.cdNum}>{countdown.days}</div><div className={s.cdLbl}>Days</div></div>
            <div className={s.cdUnit}><div className={s.cdNum}>{pad(countdown.hours)}</div><div className={s.cdLbl}>Hrs</div></div>
            <div className={s.cdUnit}><div className={s.cdNum}>{pad(countdown.mins)}</div><div className={s.cdLbl}>Mins</div></div>
            <div className={s.cdUnit}><div className={s.cdNum}>{pad(countdown.secs)}</div><div className={s.cdLbl}>Secs</div></div>
          </div>
        ) : (
          <div className={s.countdownDigits}>
            <div className={s.cdUnit}><div className={s.cdNum}>—</div><div className={s.cdLbl}>Days</div></div>
            <div className={s.cdUnit}><div className={s.cdNum}>—</div><div className={s.cdLbl}>Hrs</div></div>
            <div className={s.cdUnit}><div className={s.cdNum}>—</div><div className={s.cdLbl}>Mins</div></div>
            <div className={s.cdUnit}><div className={s.cdNum}>—</div><div className={s.cdLbl}>Secs</div></div>
          </div>
        )}

        <button className={s.fieldToggle} onClick={() => setFieldOpen(o => !o)}>
          <span>The Field · {(fieldPlayers ?? players).length} players</span>
          <ChevronDown size={14} strokeWidth={2} className={`${s.fieldChevron} ${fieldOpen ? s.fieldChevronOpen : ''}`} />
        </button>
      </div>

      {fieldOpen && (
        <div className={s.rosterStrip}>
          <div className={s.rosterGrid}>
            {[...(fieldPlayers ?? players)]
              .sort((a, b) => (hcpByPlayer[a.id]?.tiff_handicap ?? 99) - (hcpByPlayer[b.id]?.tiff_handicap ?? 99))
              .map(p => {
                const hcp = hcpByPlayer[p.id]
                const isChamp = p.id === reigningChampionId
                return (
                  <Link key={p.id} to={`/players/${p.id}`} className={s.rosterCard}>
                    <div className={`${s.rosterAvatar} ${isChamp ? s.champion : ''}`}>
                      {initials(p.name || p.full_name)}
                    </div>
                    <div className={s.rosterFullName}>{p.full_name ?? p.name ?? '?'}</div>
                    {hcp && <div className={s.rosterHcp}>HCP {hcp.tiff_handicap}</div>}
                  </Link>
                )
              })}
          </div>
        </div>
      )}

      {/* Championships */}
      <div className={s.sectionHdr}>
        <span className={s.sectionTitle}>Championships</span>
        <span className={s.sectionSub}>{completedTournaments.length} year{completedTournaments.length !== 1 ? 's' : ''}</span>
      </div>
      <div className={s.champCards}>
        {loading ? null : cardsByTournament.map(({ tournament: t, top3 }) => {
          const champ  = top3.find(r => r.position === 1)
          const others = top3.filter(r => r.position > 1)

          function vsPar(r) {
            if (r?.net_total == null || r?.rounds_played == null) return null
            const diff = Math.round(Number(r.net_total) - r.rounds_played * 72)
            return diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff)
          }

          const champVsPar = vsPar(champ)

          return (
            <div key={t.id} className={s.champCard}>
              <Link to={`/history/${t.year}`} className={s.champCardTop}>
                <div>
                  <div className={s.champCardYear}>{t.year}</div>
                  {t.name && <div className={s.champCardTripName}>{t.name}</div>}
                </div>
                <div className={s.champCardLocation}>{t.location}</div>
              </Link>
              <div className={s.champCardBody}>
                <div className={s.champCardWinner}>
                  <div>
                    <div className={s.champCardWinnerLbl}>🏆 Champion</div>
                    {champ ? (
                      <Link to={`/players/${champ.player_id}`} className={s.champCardWinnerName}>
                        {champ.players?.full_name ?? champ.players?.name ?? '—'}
                      </Link>
                    ) : (
                      <div className={s.champCardWinnerName}>—</div>
                    )}
                  </div>
                  {champVsPar && <div className={s.champCardNet}>{champVsPar}</div>}
                </div>
                {others.length > 0 && (
                  <div className={s.champCardPodium}>
                    {others.map(r => (
                      <div key={r.player_id} className={s.champCardPodRow}>
                        <span className={s.champCardPodPos}>{r.position}</span>
                        <Link to={`/players/${r.player_id}`} className={s.champCardPodName}>
                          {r.players?.full_name ?? r.players?.name ?? '—'}
                        </Link>
                        {vsPar(r) && (
                          <span className={s.champCardPodNet}>{vsPar(r)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
