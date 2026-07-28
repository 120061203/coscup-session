import SessionCluster from './SessionCluster'
import { sessionStatus } from '../lib/time'

export default function TimelineRow({ list, conflictCount, interestMap, onRate, now }) {
  const time = list[0].start.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const isOngoing = list.some((s) => sessionStatus(s, now) === 'ongoing')
  const isPast = list.every((s) => sessionStatus(s, now) === 'past')

  return (
    <div className="timeline-row">
      <div className="timeline-rail">
        <span className="timeline-time">{time}</span>
        <span className={`timeline-dot ${isOngoing ? 'ongoing' : ''} ${isPast ? 'past' : ''}`} />
      </div>
      <div className="timeline-content">
        <SessionCluster
          cluster={list}
          conflictCount={conflictCount}
          interestMap={interestMap}
          onRate={onRate}
          now={now}
        />
      </div>
    </div>
  )
}
