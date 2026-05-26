import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import styles from './Commissioner.module.css'

export default function Commissioner({ tournament }) {
  const [step, setStep] = useState('roster') // 'roster' | 'handicaps'
  const [allPlayers, setAllPlayers] = useState([])
  const [roster, setRoster] = useState(new Set()) // player_ids
  const [rosterSaved, setRosterSaved] = useState(false)
  const [rows, setRows] = useState([])
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locking, setLocking] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tournament) return
    fetchData()
  }, [tournament?.id])

  async function fetchData() {
    setLoading(true)
    const [
      { data: players, error: pErr },
      { data: rosterRows },
      { data: snapshots },
    ] = await Promise.all([
      supabase.from('players').select('id, name, full_name, ghin_index').order('full_name'),
      supabase.from('tournament_players').select('player_id').eq('tournament_id', tournament.id),
      supabase.from('handicap_snapshots').select('*').eq('tournament_id', tournament.id),
    ])

    if (pErr) { setError(pErr.message); setLoading(false); return }

    setAllPlayers(players)

    if (snapshots?.length > 0) {
      // Already locked — build read-only rows from snapshots
      const snap = Object.fromEntries(snapshots.map(s => [s.player_id, s]))
      const playerMap = Object.fromEntries(players.map(p => [p.id, p]))
      setRows(
        snapshots.map(s => ({
          ...playerMap[s.player_id],
          tiff_handicap: s.tiff_calculated,
          tier: methodToTier(s.method),
          total_rounds: s.rounds_used ?? 0,
          playing_handicap: s.playing_handicap,
          method: s.method,
          note: s.commissioner_note ?? '',
          isOverridden: s.method === 'commissioner',
        }))
      )
      setLocked(true)
      setStep('handicaps')
    } else if (rosterRows?.length > 0) {
      const rosterSet = new Set(rosterRows.map(r => r.player_id))
      setRoster(rosterSet)
      setRosterSaved(true)
      setStep('handicaps')
      await buildHandicapRows(players, rosterSet)
    }

    setLoading(false)
  }

  async function buildHandicapRows(players, rosterSet) {
    const { data: calcs } = await supabase
      .from('v_tiff_handicap_by_year')
      .select('*')
      .eq('year', tournament.year)

    const calcMap = Object.fromEntries((calcs ?? []).map(c => [c.player_id, c]))
    const rostered = players.filter(p => rosterSet.has(p.id))

    setRows(rostered.map(p => {
      const calc = calcMap[p.id]
      const tiffHcp = calc?.tiff_handicap ?? null
      const tier = calc?.tier ?? 'insufficient'
      const totalRounds = calc?.total_rounds ?? 0
      const defaultHcp = tiffHcp ?? p.ghin_index ?? null
      const method = tiffHcp
        ? (tier === 'established' ? 'tiff_established' : 'tiff_provisional')
        : p.ghin_index ? 'ghin' : null
      return {
        ...p, tiff_handicap: tiffHcp, tier, total_rounds: totalRounds,
        playing_handicap: defaultHcp, method, note: '', isOverridden: false,
      }
    }))
  }

  function methodToTier(method) {
    if (method === 'tiff_established') return 'established'
    if (method === 'tiff_provisional') return 'provisional'
    return 'insufficient'
  }

  function toggleRoster(playerId) {
    setRoster(prev => {
      const next = new Set(prev)
      next.has(playerId) ? next.delete(playerId) : next.add(playerId)
      return next
    })
  }

  async function saveRoster() {
    if (roster.size === 0) { alert('Select at least one player.'); return }
    setSaving(true)

    // Replace roster: delete existing, insert new
    await supabase.from('tournament_players').delete().eq('tournament_id', tournament.id)
    const { error } = await supabase.from('tournament_players').insert(
      [...roster].map(player_id => ({ tournament_id: tournament.id, player_id }))
    )
    if (error) { alert('Error saving roster: ' + error.message); setSaving(false); return }

    setRosterSaved(true)
    await buildHandicapRows(allPlayers, roster)
    setStep('handicaps')
    setSaving(false)
  }

  function handleHcpChange(id, value) {
    setRows(rows.map(row => {
      if (row.id !== id) return row
      const num = value === '' ? null : parseFloat(value)
      const isOverridden = num !== row.tiff_handicap
      const method = !isOverridden && row.tiff_handicap != null
        ? (row.tier === 'established' ? 'tiff_established' : 'tiff_provisional')
        : row.ghin_index && num === row.ghin_index ? 'ghin' : 'commissioner'
      return { ...row, playing_handicap: num, method, isOverridden }
    }))
  }

  function handleNoteChange(id, value) {
    setRows(rows.map(row => row.id === id ? { ...row, note: value } : row))
  }

  async function handleLock() {
    const missing = rows.filter(r => r.playing_handicap == null)
    if (missing.length > 0) {
      alert(`Set handicaps for: ${missing.map(r => r.full_name).join(', ')}`)
      return
    }
    if (!confirm(`Lock handicaps for ${tournament.year}? This cannot be undone.`)) return

    setLocking(true)
    const { error: snapErr } = await supabase.from('handicap_snapshots').insert(
      rows.map(row => ({
        tournament_id: tournament.id,
        player_id: row.id,
        playing_handicap: row.playing_handicap,
        method: row.method ?? 'commissioner',
        tiff_calculated: row.tiff_handicap,
        ghin_at_time: row.ghin_index,
        rounds_used: row.total_rounds,
        commissioner_note: row.note || null,
        locked_at: new Date().toISOString(),
      }))
    )
    if (snapErr) { alert('Error: ' + snapErr.message); setLocking(false); return }

    await supabase
      .from('tournaments')
      .update({ handicaps_locked: true, status: 'active' })
      .eq('id', tournament.id)

    setLocked(true)
    setLocking(false)
  }

  if (loading) return <p className={styles.loading}>Loading…</p>
  if (error) return <p className={styles.loading}>Error: {error}</p>

  if (step === 'roster') {
    return <RosterStep
      players={allPlayers}
      roster={roster}
      tournament={tournament}
      saving={saving}
      onToggle={toggleRoster}
      onSave={saveRoster}
    />
  }

  // Handicaps step
  const established = rows.filter(r => r.tier === 'established')
  const provisional  = rows.filter(r => r.tier === 'provisional')
  const other        = rows.filter(r => r.tier === 'insufficient')
  const needsAttention = rows.filter(r => r.playing_handicap == null)

  return (
    <div className={styles.wrap}>
      <div className={styles.banner}>
        {locked
          ? `${tournament.year} Handicaps Locked · ${rows.length} players`
          : `${tournament.year} Handicap Review · ${rows.length} players`}
        {!locked && (
          <button className={styles.editRosterBtn} onClick={() => setStep('roster')}>
            Edit Roster
          </button>
        )}
      </div>

      {!locked && needsAttention.length > 0 && (
        <div className={styles.alert}>
          <div className={styles.alertHd}>⚠ {needsAttention.length} player{needsAttention.length > 1 ? 's' : ''} need a handicap assigned</div>
          <div className={styles.alertBody}>{needsAttention.map(r => r.full_name).join(', ')}</div>
        </div>
      )}

      {established.length > 0 && (
        <Section title="Established — 5+ Tiff rounds" rows={established} locked={locked}
          onHcpChange={handleHcpChange} onNoteChange={handleNoteChange} />
      )}
      {provisional.length > 0 && (
        <Section title="Provisional — 3–4 Tiff rounds" rows={provisional} locked={locked}
          onHcpChange={handleHcpChange} onNoteChange={handleNoteChange} />
      )}
      {other.length > 0 && (
        <Section title="Commissioner Assigned — new or insufficient history" rows={other} locked={locked}
          onHcpChange={handleHcpChange} onNoteChange={handleNoteChange} />
      )}

      {!locked && (
        <div className={styles.lockWrap}>
          <button className={styles.lockBtn} onClick={handleLock} disabled={locking}>
            {locking ? 'Locking…' : '🔒 Lock & Start Tournament'}
          </button>
        </div>
      )}
      {locked && <div className={styles.lockedNote}>Handicaps locked. The tournament is live.</div>}
    </div>
  )
}

function RosterStep({ players, roster, tournament, saving, onToggle, onSave }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.banner}>
        {tournament.year} · Set Roster — {roster.size} player{roster.size !== 1 ? 's' : ''} selected
      </div>
      <div className={styles.rosterList}>
        {players.map((p, i) => (
          <label
            key={p.id}
            className={`${styles.rosterRow} ${i % 2 === 1 ? styles.rowAlt : ''} ${roster.has(p.id) ? styles.rosterChecked : ''}`}
          >
            <input
              type="checkbox"
              className={styles.rosterCheck}
              checked={roster.has(p.id)}
              onChange={() => onToggle(p.id)}
            />
            <div>
              <div className={styles.name}>{p.full_name}</div>
              {p.ghin_index && <div className={styles.meta}>GHIN {p.ghin_index}</div>}
            </div>
          </label>
        ))}
      </div>
      <div className={styles.lockWrap}>
        <button className={styles.lockBtn} onClick={onSave} disabled={saving || roster.size === 0}>
          {saving ? 'Saving…' : `Confirm Roster (${roster.size}) →`}
        </button>
      </div>
    </div>
  )
}

function Section({ title, rows, locked, onHcpChange, onNoteChange }) {
  return (
    <div>
      <div className={styles.secHdr}>{title}</div>
      {rows.map((row, i) => (
        <PlayerRow key={row.id} row={row} alt={i % 2 === 1} locked={locked}
          onHcpChange={onHcpChange} onNoteChange={onNoteChange} />
      ))}
    </div>
  )
}

function PlayerRow({ row, alt, locked, onHcpChange, onNoteChange }) {
  const tierLabel = row.tier === 'established' ? 'Est.'
    : row.tier === 'provisional' ? 'Prov.'
    : row.isOverridden ? 'Ovrd' : 'New'
  const tierClass = row.tier === 'established' ? styles.tagEst
    : row.tier === 'provisional' ? styles.tagProv
    : row.isOverridden ? styles.tagOvrd : styles.tagNew

  const meta = row.tiff_handicap != null
    ? `${row.total_rounds} rounds · Tiff ${row.tiff_handicap}${row.ghin_index ? ` / GHIN ${row.ghin_index}` : ''}`
    : row.ghin_index ? `1st Tiff · GHIN ${row.ghin_index}` : 'No Tiff history · No GHIN on file'

  return (
    <div className={`${styles.row} ${alt ? styles.rowAlt : ''} ${row.isOverridden ? styles.rowFlagged : ''}`}>
      <div className={styles.playerInfo}>
        <div className={styles.name}>{row.full_name}</div>
        <div className={`${styles.meta} ${!row.tiff_handicap && !row.ghin_index ? styles.metaWarn : ''}`}>{meta}</div>
        {!locked && row.isOverridden && (
          <input className={styles.noteInput} placeholder="Override note (optional)"
            value={row.note} onChange={e => onNoteChange(row.id, e.target.value)} />
        )}
        {locked && row.note && <div className={styles.meta}>{row.note}</div>}
      </div>
      <div className={styles.hcpBlock}>
        <div className={styles.hcpLbl}>{row.isOverridden ? 'Override' : 'Starting'}</div>
        {locked ? (
          <div className={`${styles.hcpNum} ${row.isOverridden ? styles.hcpOverride : ''}`}>
            {row.playing_handicap ?? '—'}
          </div>
        ) : (
          <input
            className={`${styles.hcpInput} ${row.isOverridden ? styles.hcpOverride : ''}`}
            type="number" step="0.1" min="0" max="54"
            value={row.playing_handicap ?? ''}
            onChange={e => onHcpChange(row.id, e.target.value)}
          />
        )}
      </div>
      <div className={`${styles.tierTag} ${tierClass}`}>{tierLabel}</div>
    </div>
  )
}
