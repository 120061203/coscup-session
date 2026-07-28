import SessionCard from './SessionCard'

export default function SessionCluster({ cluster, conflictCount, interestMap, onRate, now }) {
  const isGrouped = cluster.length > 1
  const highInterestCount = cluster.filter((s) => (interestMap[s.id] || 0) >= 4).length

  return (
    <div className="cluster">
      {isGrouped && (
        <div className="cluster-header">
          <span>⏰ 同時段 {cluster.length} 場</span>
          {highInterestCount >= 2 && (
            <span className="cluster-warning">
              ⚠️ 其中 {highInterestCount} 場你評分 ≥ 4，請比較後擇一
            </span>
          )}
        </div>
      )}
      <div className={`cluster-grid ${isGrouped ? 'multi' : ''}`}>
        {cluster.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            interest={interestMap[session.id] || 0}
            onRate={onRate}
            now={now}
            conflictCount={conflictCount}
          />
        ))}
      </div>
    </div>
  )
}
