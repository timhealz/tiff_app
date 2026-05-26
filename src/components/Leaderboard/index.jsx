import styles from './Leaderboard.module.css'
import { useLeaderboard } from '../../hooks/useLeaderboard'

function hcpBadge(method, handicap) {
  const h = handicap != null ? handicap : '—'
  if (method === 'tiff_established') return { text: `Tiff ${h}`,  cls: styles.t1 }
  if (method === 'tiff_provisional') return { text: `Tiff* ${h}`, cls: styles.t2 }
  if (method === 'ghin')             return { text: `GHIN ${h}`,  cls: styles.t3 }
  return                                    { text: `Cmsr ${h}`,  cls: styles.t3 }
}

function vsParStr(vsPar) {
  if (vsPar == null) return { text: '—',            cls: '' }
  if (vsPar === 0)   return { text: 'E',             cls: styles.even }
  if (vsPar < 0)     return { text: `−${Math.abs(vsPar)}`, cls: styles.under }
  return                    { text: `+${vsPar}`,     cls: styles.over }
}

function thruStr(row) {
  if (row.holes_in_progress != null) return `${row.holes_in_progress}▸`
  if (row.rounds_complete > 0)       return 'F'
  return '—'
}

export default function Leaderboard({ tournament }) {
  const { leaderboard, loading, error } = useLeaderboard(tournament?.id ?? null)
  const isActive = tournament?.status === 'active'

  if (!tournament) return (
    <div className={styles.empty}>
      <div className={styles.emptyIco}>⛳</div>
      <div className={styles.emptyMsg}>No active tournament</div>
    </div>
  )

  if (loading) return <div className={styles.loading}>Loading…</div>
  if (error)   return <div className={styles.loading}>Error loading leaderboard</div>

  return (
    <div className={styles.wrap}>
      <div className={styles.banner}>
        <span className={styles.bannerTitle}>Net Stroke · Cumulative</span>
        <div className={styles.dayTabs}>
          <div className={`${styles.dtab} ${styles.dtabActive}`}>All</div>
        </div>
      </div>

      <div className={styles.thead}>
        <span className={styles.th} />
        <span className={`${styles.th} ${styles.thLeft}`}>Player</span>
        <span className={styles.th}>Net</span>
        <span className={styles.th}>+/−</span>
        <span className={styles.th}>Thru</span>
      </div>

      {leaderboard.length === 0 ? (
        <div className={styles.noScores}>
          {isActive
            ? 'First round in progress — scores coming soon'
            : 'Handicaps set · Awaiting first round'}
        </div>
      ) : (
        leaderboard.map((row, i) => {
          const isLead = row.position === 1
          const isAlt  = i % 2 === 1
          const hcp    = hcpBadge(row.handicap_method, row.playing_handicap)
          const vsPar  = vsParStr(row.total_vs_par)

          return (
            <div
              key={row.player_id}
              className={[
                styles.row,
                isAlt  ? styles.alt     : '',
                isLead ? (isAlt ? styles.leadAlt : styles.lead) : '',
              ].join(' ')}
            >
              <div className={`${styles.pos} ${isLead ? styles.pos1 : ''}`}>
                {isLead ? '🏆' : row.position}
              </div>
              <div className={styles.player}>
                <div className={styles.name}>{row.player_name}</div>
                <span className={`${styles.hcp} ${hcp.cls}`}>{hcp.text}</span>
              </div>
              <div className={styles.cell}>{row.total_net ?? '—'}</div>
              <div className={`${styles.cell} ${vsPar.cls}`}>{vsPar.text}</div>
              <div className={`${styles.cell} ${styles.thru}`}>{thruStr(row)}</div>
            </div>
          )
        })
      )}

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.ldot} style={{ background: 'var(--gold)' }} />
          Tiff Est.
        </div>
        <div className={styles.legendItem}>
          <div className={styles.ldot} style={{ background: 'var(--sc-green-lite)' }} />
          Tiff Prov.
        </div>
        <div className={styles.legendItem}>
          <div className={styles.ldot} style={{ background: 'var(--sc-rule)' }} />
          GHIN/Cmsr
        </div>
      </div>
    </div>
  )
}
