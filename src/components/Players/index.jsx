import { useState, useMemo } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import PlayerRow from '../shared/PlayerRow'
import s from './Players.module.css'

const SORTS = ['Wins', 'HCP', 'Trips', 'Avg vs Par']

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
          <PlayerRow
            key={player.id}
            player={player}
            variant="list-row"
            alt={i % 2 === 1}
          />
        ))
      )}
    </div>
  )
}
