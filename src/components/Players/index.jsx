import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePlayers } from '../../hooks/usePlayers'
import s from './Players.module.css'

const SORTS = ['Wins', 'HCP', 'Trips', 'Avg vs Par']

function initials(str) {
  if (!str) return '?'
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function tierClass(tier) {
  if (tier === 'established') return s.t1
  if (tier === 'provisional') return s.t2
  return s.t3
}

function fmtAvg(val) {
  if (val == null || !isFinite(val)) return '—'
  const n = Math.round(val)
  if (n === 0) return 'E'
  return n > 0 ? `+${n}` : String(n)
}

export default function Players() {
  const { data: players, loading } = usePlayers()
  const [query, setQuery] = useState('')
  const [sort, setSort]   = useState('Wins')

  const filtered = useMemo(() => {
    if (!players) return []
    const q = query.trim().toLowerCase()
    let list = q
      ? players.filter(p => (p.full_name ?? '').toLowerCase().includes(q) || (p.name ?? '').toLowerCase().includes(q))
      : [...players]

    switch (sort) {
      case 'HCP':        list.sort((a, b) => (a.hcp?.tiff_handicap ?? 99) - (b.hcp?.tiff_handicap ?? 99)); break
      case 'Trips':      list.sort((a, b) => b.trips - a.trips || b.wins - a.wins); break
      case 'Avg vs Par': list.sort((a, b) => {
        const av = a.avgVsPar ?? Infinity
        const bv = b.avgVsPar ?? Infinity
        return av - bv
      }); break
      default:           list.sort((a, b) => b.wins - a.wins || b.trips - a.trips); break
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
          <div className={s.th}>W</div>
          <div className={s.th}>Net Avg</div>
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
                  <div className={s.playerSub}>
                    {player.trips} trip{player.trips !== 1 ? 's' : ''}
                    {player.isChampion ? ' · 🏆' : ''}
                  </div>
                </div>
              </div>
              <div className={`${s.hcpChip} ${tierClass(player.hcp?.tier)}`}>
                {player.hcp ? player.hcp.tiff_handicap : '—'}
              </div>
              <div className={s.cell}>{player.wins || '—'}</div>
              <div className={`${s.cell} ${s.avg}`}>{fmtAvg(player.avgVsPar)}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
