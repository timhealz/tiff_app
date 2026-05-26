import { usePlayerContext } from '../../contexts/PlayerContext'
import Leaderboard from '../Leaderboard'
import OffSeason from './OffSeason'
import PostTournament from './PostTournament'

export default function Home() {
  const { tournament } = usePlayerContext()

  if (!tournament) return null

  if (tournament.status === 'active') {
    return (
      <div style={{ padding: 16 }}>
        <Leaderboard tournament={tournament} />
      </div>
    )
  }

  if (tournament.status === 'complete') return <PostTournament tournament={tournament} />
  return <OffSeason upcoming={tournament} />
}
