import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { useTournaments } from '../../hooks/useTournaments'
import { useAllTimeStandings } from '../../hooks/useAllTimeStandings'
import SectionHeader from '../shared/SectionHeader'
import TournamentCard from '../shared/TournamentCard'
import PlayerRow from '../shared/PlayerRow'
import AllTimeStandings from '../shared/AllTimeStandings'
import s from './Home.module.css'

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
  const { data: tournaments } = useTournaments()
  const { data: standings }   = useAllTimeStandings()

  const [countdown, setCountdown] = useState(() => calcCountdown(upcoming?.date))
  const [field, setField]         = useState(null) // rostered players for upcoming
  const [hcpByPlayer, setHcpByPlayer] = useState({})

  useEffect(() => {
    if (!upcoming?.date) return
    const id = setInterval(() => setCountdown(calcCountdown(upcoming.date)), 1000)
    return () => clearInterval(id)
  }, [upcoming?.date])

  // Roster for upcoming (falls back to all players)
  useEffect(() => {
    async function load() {
      const [roster, allPlayers, hcps] = await Promise.all([
        upcoming?.id
          ? supabase
              .from('tournament_players')
              .select('players(id, name, full_name)')
              .eq('tournament_id', upcoming.id)
          : Promise.resolve({ data: [] }),
        supabase.from('players').select('id, name, full_name').order('full_name'),
        supabase
          .from('v_tiff_handicap_by_year')
          .select('player_id, year, tiff_handicap, total_rounds, tier'),
      ])

      const rosterPlayers = (roster.data ?? []).map(r => r.players).filter(Boolean)
      const players = rosterPlayers.length > 0
        ? rosterPlayers
        : (allPlayers.data ?? [])

      const allHcps = hcps.data ?? []
      const maxYear = allHcps.reduce((m, r) => Math.max(m, r.year), 0)
      const map = Object.fromEntries(allHcps.filter(r => r.year === maxYear).map(r => [r.player_id, r]))

      setField(players)
      setHcpByPlayer(map)
    }
    load()
  }, [upcoming?.id])

  // Reigning champion id (for gold avatar border)
  const mostRecentComplete = (tournaments ?? []).find(t => t.status === 'complete')
  const reigningChampionId = mostRecentComplete?.champion?.player_id ?? null

  const completedTournaments = (tournaments ?? []).filter(t => t.status === 'complete')

  const sortedField = [...(field ?? [])].sort((a, b) =>
    (hcpByPlayer[a.id]?.tiff_handicap ?? 99) - (hcpByPlayer[b.id]?.tiff_handicap ?? 99)
  )

  return (
    <div>
      {/* Countdown hero — compact */}
      <div className={s.countdownHero}>
        <div className={s.cdhTitle}>
          {(upcoming?.name ?? `${upcoming?.year ?? ''} Annual Tiff`).replace(/^the\s+/i, '')}
        </div>
        {upcoming?.location && (
          <div className={s.cdhLocation}>📍 {upcoming.location}</div>
        )}
        <div className={s.cdhEyebrow}>Next Tiff in</div>
        <div className={s.countdownDigits}>
          <div className={s.cdUnit}><div className={s.cdNum}>{countdown?.days ?? '—'}</div><div className={s.cdLbl}>Days</div></div>
          <div className={s.cdUnit}><div className={s.cdNum}>{countdown ? pad(countdown.hours) : '—'}</div><div className={s.cdLbl}>Hrs</div></div>
          <div className={s.cdUnit}><div className={s.cdNum}>{countdown ? pad(countdown.mins) : '—'}</div><div className={s.cdLbl}>Mins</div></div>
          <div className={s.cdUnit}><div className={s.cdNum}>{countdown ? pad(countdown.secs) : '—'}</div><div className={s.cdLbl}>Secs</div></div>
        </div>
      </div>

      {/* The Field — horizontal scroll */}
      <SectionHeader title="The Field" seeAllTo="/players" seeAllLabel="All players" />
      <div className={s.rosterStrip}>
        <div className={s.rosterScroll}>
          {sortedField.length === 0 ? (
            <div className={s.rosterEmpty}>No players yet</div>
          ) : (
            <>
              {sortedField.map(p => (
                <PlayerRow
                  key={p.id}
                  variant="avatar"
                  player={{
                    ...p,
                    hcp: hcpByPlayer[p.id] ?? null,
                    isChampion: p.id === reigningChampionId,
                  }}
                />
              ))}
              <Link to="/players" className={s.rosterSeeAll}>
                <div className={s.seeAllCardArrow}>→</div>
                <div className={s.seeAllCardText}>All<br/>players</div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Tournaments — horizontal scroll, 3 cards + "View all" */}
      <SectionHeader
        title="Recent Tournaments"
        seeAllTo="/tournaments"
        seeAllLabel={`All ${completedTournaments.length} year${completedTournaments.length !== 1 ? 's' : ''}`}
      />
      <div className={s.resultsScrollWrap}>
        <div className={s.resultsScroll}>
          {completedTournaments.slice(0, 3).map(t => (
            <TournamentCard key={t.id} tournament={t} variant="compact" />
          ))}
          {completedTournaments.length > 3 && (
            <Link to="/tournaments" className={s.seeAllCard}>
              <div className={s.seeAllCardArrow}>→</div>
              <div className={s.seeAllCardText}>View<br/>all {completedTournaments.length}</div>
            </Link>
          )}
        </div>
      </div>

      {/* All-Time Top 3 — preview */}
      <SectionHeader title="All-Time Top 3" seeAllTo="/records" seeAllLabel="Full records" />
      {standings && (
        <AllTimeStandings
          standings={standings}
          limit={3}
          seeMoreTo="/records"
        />
      )}
    </div>
  )
}
