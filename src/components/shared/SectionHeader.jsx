import { Link } from 'react-router-dom'
import s from './shared.module.css'

export default function SectionHeader({ title, subtitle, seeAllTo, seeAllLabel }) {
  return (
    <div className={s.sectionHdr}>
      <span className={s.sectionTitle}>{title}</span>
      {seeAllTo ? (
        <Link to={seeAllTo} className={s.seeAll}>
          {seeAllLabel ?? 'See all'} →
        </Link>
      ) : subtitle ? (
        <span className={s.sectionSub}>{subtitle}</span>
      ) : null}
    </div>
  )
}
