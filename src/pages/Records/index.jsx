import { useRecords } from '../../hooks/useRecords'
import { useAllTimeStandings } from '../../hooks/useAllTimeStandings'
import SectionHeader from '../../components/shared/SectionHeader'
import RecordsHighlights from '../../components/shared/RecordsHighlights'
import AllTimeStandings from '../../components/shared/AllTimeStandings'
import s from './Records.module.css'

export default function Records() {
  const { data: records, loading: recordsLoading } = useRecords()
  const { data: standings, loading: standingsLoading } = useAllTimeStandings()

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.pageTitle}>Records</div>
        {records && (
          <div className={s.pageSub}>
            {records.totalYears} year{records.totalYears !== 1 ? 's' : ''} · {records.totalRounds} rounds
          </div>
        )}
      </div>

      <SectionHeader title="All-Time Records" subtitle="Single round bests" />
      {recordsLoading ? (
        <div className={s.empty}>Loading…</div>
      ) : (
        <RecordsHighlights records={records} count={6} />
      )}

      <SectionHeader title="Hall of Fame" subtitle="All-time standings" />
      {standingsLoading ? (
        <div className={s.empty}>Loading…</div>
      ) : (
        <AllTimeStandings standings={standings} />
      )}
    </div>
  )
}
