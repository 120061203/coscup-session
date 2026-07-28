import { useEffect, useMemo, useState } from 'react'
import { fetchSessions } from './lib/coscupApi'
import { loadInterestMap, saveInterest } from './lib/interest'
import { groupByOverlap } from './lib/conflicts'
import { formatDayLabel, sessionStatus, minutesUntil } from './lib/time'
import FilterBar from './components/FilterBar'
import TimelineRow from './components/TimelineRow'
import './App.css'

export default function App() {
  const [sessions, setSessions] = useState([])
  const [interestMap, setInterestMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [now, setNow] = useState(new Date())

  const [view, setView] = useState('browse')
  const [timeFilter, setTimeFilter] = useState('all')
  const [day, setDay] = useState('all')
  const [track, setTrack] = useState('all')
  const [building, setBuilding] = useState([])
  const [floor, setFloor] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('time')
  const [myThreshold, setMyThreshold] = useState(4)
  const [filterCollapsed, setFilterCollapsed] = useState(false)

  useEffect(() => {
    const TOP_THRESHOLD = 10
    const COLLAPSE_THRESHOLD = 80
    const onScroll = () => {
      const y = window.scrollY
      if (y <= TOP_THRESHOLD) setFilterCollapsed(false)
      else if (y > COLLAPSE_THRESHOLD) setFilterCollapsed(true)
      // between the two thresholds: leave whatever state it's in, so a manual
      // expand near the top isn't immediately fought back to collapsed
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetchSessions()
      .then(({ sessions, fromCache }) => {
        setSessions(sessions)
        setFromCache(fromCache)
        setInterestMap(loadInterestMap(sessions.map((s) => s.id)))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const days = useMemo(() => {
    const keys = [...new Set(sessions.map((s) => s.day))].sort()
    return keys.map((key) => ({ key, label: formatDayLabel(key) }))
  }, [sessions])

  const tracks = useMemo(() => {
    return [...new Set(sessions.map((s) => s.track).filter(Boolean))].sort()
  }, [sessions])

  const buildings = useMemo(() => {
    return [...new Set(sessions.map((s) => s.location.building).filter(Boolean))].sort()
  }, [sessions])

  const floors = useMemo(() => {
    if (building.length !== 1) return []
    return [
      ...new Set(
        sessions
          .filter((s) => s.location.building === building[0])
          .map((s) => s.location.floor)
          .filter((f) => f != null)
      ),
    ].sort((a, b) => a - b)
  }, [sessions, building])

  const toggleBuilding = (b) => {
    setBuilding((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]))
    setFloor([])
  }

  const toggleFloor = (f) => {
    setFloor((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  const rate = (id, value) => {
    setInterestMap((prev) => {
      const next = { ...prev, [id]: value }
      saveInterest(next)
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = sessions

    if (day !== 'all') list = list.filter((s) => s.day === day)
    if (building.length > 0) list = list.filter((s) => building.includes(s.location.building))
    if (building.length === 1 && floor.length > 0) {
      list = list.filter((s) => floor.includes(s.location.floor))
    }

    if (view === 'my') {
      list = list.filter((s) => (interestMap[s.id] || 0) >= myThreshold)
    } else {
      if (track !== 'all') list = list.filter((s) => s.track === track)
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        list = list.filter(
          (s) =>
            s.titleZh.toLowerCase().includes(q) ||
            s.titleEn.toLowerCase().includes(q) ||
            s.room.toLowerCase().includes(q) ||
            s.speakers.join(' ').toLowerCase().includes(q)
        )
      }
      if (timeFilter === 'now') {
        list = list.filter((s) => sessionStatus(s, now) === 'ongoing')
      } else if (timeFilter === 'soon') {
        list = list.filter((s) => {
          const status = sessionStatus(s, now)
          return status === 'ongoing' || (status === 'upcoming' && minutesUntil(s, now) <= 60)
        })
      }
    }

    return list
  }, [sessions, view, day, building, floor, track, search, timeFilter, myThreshold, interestMap, now])

// Cluster by overlap first (so conflict counts always reflect real overlaps).
  // Same-timeslot sessions stay together as one row rendered via a swipeable
  // carousel — sorting by interest re-orders rows by their best pick and jumps
  // the carousel to that pick, instead of flattening the cluster apart (which
  // would scatter conflicting sessions to different places in the list).
  const clusters = useMemo(() => groupByOverlap(filtered), [filtered])

  const renderClusters = useMemo(() => {
    if (sortBy !== 'interest') {
      return clusters.map((cluster) => ({ list: cluster, conflictCount: cluster.length - 1, initialIndex: 0 }))
    }
    return clusters
      .map((cluster) => {
        let bestIndex = 0
        let bestScore = -1
        cluster.forEach((session, i) => {
          const score = interestMap[session.id] || 0
          if (score > bestScore) {
            bestScore = score
            bestIndex = i
          }
        })
        return { list: cluster, conflictCount: cluster.length - 1, initialIndex: bestIndex, bestScore }
      })
      .sort((a, b) => b.bestScore - a.bestScore)
  }, [clusters, sortBy, interestMap])

  // Insert a day-divider before the first row of each day when browsing
  // multiple days chronologically (dividers don't make sense once sorted by
  // interest, since rows no longer run in date order).
  const renderItems = useMemo(() => {
    if (sortBy === 'interest' || day !== 'all') {
      return renderClusters.map((row) => ({ type: 'row', ...row }))
    }
    const items = []
    let lastDay = null
    for (const row of renderClusters) {
      const rowDay = row.list[0].day
      if (rowDay !== lastDay) {
        items.push({ type: 'divider', key: `divider-${rowDay}`, label: formatDayLabel(rowDay) })
        lastDay = rowDay
      }
      items.push({ type: 'row', ...row })
    }
    return items
  }, [renderClusters, sortBy, day])

  return (
    <div className="app">
      <header className="app-header">
        <h1>COSCUP 2026 議程助手</h1>
        <span className="clock">{now.toLocaleTimeString('zh-TW', { hour12: false })}</span>
      </header>

      {fromCache && <div className="banner">⚠️ 目前離線中，顯示的是最後一次快取的議程資料</div>}
      {error && <div className="banner banner-error">載入失敗：{error}</div>}

      {filterCollapsed ? (
        <button
          type="button"
          className="filter-collapsed-bar"
          onClick={() => setFilterCollapsed(false)}
        >
          <span>🔍 篩選／排序</span>
          <span className="chevron">▾</span>
        </button>
      ) : (
        <FilterBar
          view={view}
          setView={setView}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          day={day}
          setDay={setDay}
          days={days}
          track={track}
          setTrack={setTrack}
          tracks={tracks}
          building={building}
          onToggleBuilding={toggleBuilding}
          buildings={buildings}
          floor={floor}
          onToggleFloor={toggleFloor}
          floors={floors}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          myThreshold={myThreshold}
          setMyThreshold={setMyThreshold}
        />
      )}

      {loading && <p className="status-line">載入議程中…</p>}
      {!loading && renderClusters.length === 0 && <p className="status-line">沒有符合條件的議程</p>}

      <main className="session-list">
        {renderItems.map((item) =>
          item.type === 'divider' ? (
            <div key={item.key} className="day-divider">
              {item.label}
            </div>
          ) : (
            <TimelineRow
              key={item.list[0].id}
              list={item.list}
              conflictCount={item.conflictCount}
              initialIndex={item.initialIndex}
              interestMap={interestMap}
              onRate={rate}
              now={now}
            />
          )
        )}
      </main>
    </div>
  )
}
