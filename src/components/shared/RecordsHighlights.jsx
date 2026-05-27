import { Link } from 'react-router-dom'
import s from './shared.module.css'

/**
 * 2-column grid of record stat boxes. count=4 for Home preview, count=6 for Records page.
 *
 * `records` shape (from useRecords):
 *   { mostWins, lowGross, lowDiff, lowNet, ... }
 */
export default function RecordsHighlights({ records, count = 6 }) {
  if (!records) return null

  const boxes = []

  if (records.mostWins) {
    boxes.push({
      ico:    '🏆',
      label:  'Most Championships',
      val:    `${records.mostWins.count}×`,
      valKind: 'gold',
      playerId: records.mostWins.player?.id,
      detail: records.mostWins.player?.full_name ?? records.mostWins.player?.name,
    })
  }
  if (records.lowGross) {
    boxes.push({
      ico:    '🎯',
      label:  'Low Gross Round',
      val:    String(records.lowGross.gross_total),
      valKind: 'green',
      playerId: records.lowGross.player?.id,
      detail: [
        records.lowGross.player?.full_name ?? records.lowGross.player?.name,
        records.lowGross.tournament?.location && records.lowGross.tournament?.year
          ? `${records.lowGross.tournament.location} · ${records.lowGross.tournament.year}`
          : null,
      ].filter(Boolean).join(' · '),
    })
  }
  if (records.lowDiff) {
    boxes.push({
      ico:    '📊',
      label:  'Low Differential',
      val:    String(records.lowDiff.differential),
      valKind: 'gold',
      playerId: records.lowDiff.player?.id,
      detail: [
        records.lowDiff.player?.full_name ?? records.lowDiff.player?.name,
        records.lowDiff.tournament?.location && records.lowDiff.tournament?.year
          ? `${records.lowDiff.tournament.location} · ${records.lowDiff.tournament.year}`
          : null,
      ].filter(Boolean).join(' · '),
    })
  }
  if (records.lowNet) {
    boxes.push({
      ico:    '⛳',
      label:  'Low Net (avg/rd)',
      val:    String(records.lowNet.avg),
      valKind: 'green',
      playerId: records.lowNet.player?.id,
      detail: records.lowNet.player?.full_name ?? records.lowNet.player?.name,
    })
  }
  if (count >= 5) {
    boxes.push({ ico: '🐦', label: 'Most Birdies (event)', val: '—', valKind: 'gold', detail: 'Coming soon' })
  }
  if (count >= 6) {
    boxes.push({ ico: '🦅', label: 'Total Eagles', val: '—', valKind: 'green', detail: 'Coming soon' })
  }

  return (
    <div className={s.recordsGrid}>
      {boxes.slice(0, count).map((b, i) => {
        const inner = (
          <>
            <div className={s.recordsIco}>{b.ico}</div>
            <div className={s.recordsLbl}>{b.label}</div>
            <div className={`${s.recordsVal} ${b.valKind === 'gold' ? s.recordsValGold : ''} ${b.valKind === 'green' ? s.recordsValGreen : ''}`}>
              {b.val}
            </div>
            {b.detail && <div className={s.recordsDetail}>{b.detail}</div>}
          </>
        )
        const className = `${s.recordsBox} ${i % 2 === 1 ? s.recordsBoxDk : ''}`
        return b.playerId ? (
          <Link key={i} to={`/players/${b.playerId}`} className={className}>{inner}</Link>
        ) : (
          <div key={i} className={className}>{inner}</div>
        )
      })}
    </div>
  )
}
