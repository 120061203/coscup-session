import { useRef, useState } from 'react'
import SessionCard from './SessionCard'

export default function SessionCluster({ cluster, conflictCount, interestMap, onRate, now, initialIndex = 0 }) {
  const isGrouped = cluster.length > 1
  const [index, setIndex] = useState(Math.min(initialIndex, cluster.length - 1))
  const touchStartX = useRef(null)

  const highInterestCount = cluster.filter((s) => (interestMap[s.id] || 0) >= 4).length
  const current = cluster[index] ?? cluster[0]

  const goTo = (i) => setIndex(Math.max(0, Math.min(cluster.length - 1, i)))

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx > 40) goTo(index - 1)
    else if (dx < -40) goTo(index + 1)
    touchStartX.current = null
  }

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

      <div className="carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <SessionCard
          key={current.id}
          session={current}
          interest={interestMap[current.id] || 0}
          onRate={onRate}
          now={now}
          conflictCount={conflictCount}
        />
      </div>

      {isGrouped && (
        <div className="carousel-nav">
          <button
            type="button"
            className="carousel-arrow"
            aria-label="上一場"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            ‹
          </button>
          <div className="carousel-dots">
            {cluster.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`carousel-dot ${i === index ? 'active' : ''} ${
                  (interestMap[s.id] || 0) >= 4 ? 'high' : ''
                }`}
                aria-label={`第 ${i + 1} 場：${s.titleZh}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="carousel-arrow"
            aria-label="下一場"
            disabled={index === cluster.length - 1}
            onClick={() => goTo(index + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
