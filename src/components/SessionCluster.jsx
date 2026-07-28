import { useRef, useState } from 'react'
import SessionCard from './SessionCard'

// How far (in px) a drag must travel before it commits to the next/previous
// slide instead of snapping back to the current one.
const SWIPE_COMMIT_RATIO = 0.2
const SWIPE_COMMIT_MAX = 80
// Drag distance is damped past the first/last slide so it still visibly
// follows the pointer but resists going further, like a rubber band.
const EDGE_RESISTANCE = 0.35

export default function SessionCluster({ cluster, conflictCount, interestMap, onRate, now, initialIndex = 0 }) {
  const isGrouped = cluster.length > 1
  const [index, setIndex] = useState(Math.min(initialIndex, cluster.length - 1))
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const pointerStartX = useRef(null)
  const viewportRef = useRef(null)

  const highInterestCount = cluster.filter((s) => (interestMap[s.id] || 0) >= 4).length

  const goTo = (i) => setIndex(Math.max(0, Math.min(cluster.length - 1, i)))

  const onPointerDown = (e) => {
    pointerStartX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  const onPointerMove = (e) => {
    if (pointerStartX.current == null) return
    let dx = e.clientX - pointerStartX.current
    if ((index === 0 && dx > 0) || (index === cluster.length - 1 && dx < 0)) {
      dx *= EDGE_RESISTANCE
    }
    setDragOffset(dx)
  }

  const endDrag = () => {
    if (pointerStartX.current == null) return
    const width = viewportRef.current?.offsetWidth || 1
    const threshold = Math.min(SWIPE_COMMIT_MAX, width * SWIPE_COMMIT_RATIO)
    if (dragOffset > threshold) goTo(index - 1)
    else if (dragOffset < -threshold) goTo(index + 1)
    setDragOffset(0)
    setDragging(false)
    pointerStartX.current = null
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

      <div
        className="carousel"
        ref={viewportRef}
        onPointerDown={isGrouped ? onPointerDown : undefined}
        onPointerMove={isGrouped ? onPointerMove : undefined}
        onPointerUp={isGrouped ? endDrag : undefined}
        onPointerCancel={isGrouped ? endDrag : undefined}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
            transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {cluster.map((session) => (
            <div className="carousel-slide" key={session.id}>
              <SessionCard
                session={session}
                interest={interestMap[session.id] || 0}
                onRate={onRate}
                now={now}
                conflictCount={conflictCount}
              />
            </div>
          ))}
        </div>
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
