import { formatTimeRange, sessionStatus, minutesUntil } from '../lib/time'
import { locationLabel, isFarBuilding } from '../lib/location'

const STARS = [1, 2, 3, 4, 5]

export default function SessionCard({ session, interest, onRate, now, conflictCount }) {
  const status = sessionStatus(session, now)
  const untilMin = minutesUntil(session, now)
  const far = isFarBuilding(session.location.building)

  return (
    <article className={`card status-${status}`}>
      <div className="card-top">
        <span className="time-range">{formatTimeRange(session.start, session.end)}</span>
        {status === 'ongoing' && <span className="badge badge-live">進行中</span>}
        {status === 'upcoming' && untilMin <= 30 && (
          <span className="badge badge-soon">{untilMin} 分鐘後</span>
        )}
        {conflictCount > 0 && (
          <span className="badge badge-conflict" title="同時段還有其他場次">
            衝突 ×{conflictCount}
          </span>
        )}
      </div>

      <h3 className="card-title">
        <a href={session.uri} target="_blank" rel="noreferrer">
          {session.titleZh}
        </a>
      </h3>
      {session.titleEn && session.titleEn !== session.titleZh && (
        <p className="card-title-en">{session.titleEn}</p>
      )}

      <div className="card-meta">
        <span className={`meta-room ${far ? 'far' : ''}`}>
          📍 {session.room}
          <span className="location-tag">{locationLabel(session.location)}</span>
        </span>
        {session.track && <span className="meta-track">{session.track}</span>}
        {session.speakers.length > 0 && (
          <span className="meta-speakers">🎤 {session.speakers.join('、')}</span>
        )}
      </div>

      {session.tags.length > 0 && (
        <div className="tag-row">
          {session.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {session.descZh && (
        <details className="card-desc">
          <summary>議程簡介</summary>
          <p>{session.descZh}</p>
        </details>
      )}

      <div className="rate-row">
        <span className="rate-label">感興趣程度</span>
        <div className="stars">
          {STARS.map((n) => (
            <button
              key={n}
              type="button"
              className={`star ${interest >= n ? 'on' : ''}`}
              aria-label={`評 ${n} 分`}
              onClick={() => onRate(session.id, interest === n ? 0 : n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
