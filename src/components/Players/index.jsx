import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePlayers } from '../../hooks/usePlayers'
import s from './Players.module.css'

const SORTS = ['All', 'Tiff HCP', 'Wins', 'Trips']

function initials(str) {
  if (!str) return '?'
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function tierClass(tier) {
  if (tier === 'established') return s.t1
  if (tier === 'provisional') return s.t2
  return s.t3
}

export default function Players() {
  const { data: players, loading } = usePlayers()
  const [query, setQuery] = useState('')
  const [sort, setSort]   = useState('All')

  const filtered = useMemo(() => {
    if (!players) return []
    const q = query.trim().toLowerCase()
    let list = q
      ? players.filter(p => (p.full_name ?? '').toLowerCase().includes(q) || (p.name ?? '').toLowerCase().includes(q))
      : [...players]

    switch (sort) {
      case 'Tiff HCP': list.sort((a, b) => (a.hcp?.tiff_handicap ?? 99) - (b.hcp?.tiff_handicap ?? 99)); break
      case 'Wins':     list.sort((a, b) => b.wins - a.wins || b.trips - a.trips); break
      case 'Trips':    list.sort((a, b) => b.trips - a.trips || b.wins - a.wins); break
      default:         list.sort((a, b) => b.wins - a.wins || b.trips - a.trips); break
    }
    return list
  }, [players, query, sort])

  return (
    <div>
      <div className={s.searchBar}>
        <input
          className={s.searchInput}
          type="text"
          placeholder="Search players…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className={s.sortTabs}>
        {SORTS.map(tab => (
          <button
            key={tab}
            className={`${s.sortTab} ${sort === tab ? s.active : ''}`}
            onClick={() => setSort(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={s.list}>
        <div className={s.thead}>
          <div className={s.th}>Player</div>
          <div className={s.th}>HCP</div>
          <div className={s.th}>Trips</div>
        </div>

        {loading ? (
          <div className={s.empty}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className={s.empty}>No players found</div>
        ) : (
          filtered.map((player, i) => (
            <Link
              key={player.id}
              to={`/players/${player.id}`}
              className={`${s.row} ${i % 2 === 1 ? s.alt : ''}`}
            >
              <div className={s.playerCell}>
                <div className={`${s.avatar} ${player.isChampion ? s.champ : ''}`}>
                  {initials(player.name || player.full_name)}
                </div>
                <div>
                  <div className={s.playerName}>{player.full_name ?? player.name}</div>
                  <div className={s.playerTrips}>
                    {player.trips} trip{player.trips !== 1 ? 's' : ''}
                    {player.isChampion ? ' · 🏆' : ''}
                  </div>
                </div>
              </div>
              <div className={`${s.hcpChip} ${tierClass(player.hcp?.tier)}`}>
                {player.hcp ? player.hcp.tiff_handicap : '—'}
              </div>
              <div className={s.cell}>{player.trips}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
