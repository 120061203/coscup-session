import { useEffect, useMemo, useState } from 'react'
import { fetchSessions } from './lib/coscupApi'
import { loadInterestMap, saveInterest } from './lib/interest'
import { groupByOverlap } from './lib/conflicts'
import { formatDayLabel, sessionStatus, minutesUntil } from './lib/time'
import FilterBar from './components/FilterBar'
import SessionCluster from './components/SessionCluster'
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
  const [building, setBuilding] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('time')
  const [myThreshold, setMyThreshold] = useState(4)

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
    if (building !== 'all') list = list.filter((s) => s.location.building === building)

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
  }, [sessions, view, day, building, track, search, timeFilter, myThreshold, interestMap, now])

  // Cluster by overlap first (so conflict counts always reflect real overlaps),
  // then optionally re-flatten into interest-desc order for display.
  const clusters = useMemo(() => groupByOverlap(filtered), [filtered])

  const displayClusters = useMemo(() => {
    if (sortBy !== 'interest') return clusters
    return clusters
      .flatMap((cluster) => cluster.map((session) => ({ session, conflictCount: cluster.length - 1 })))
      .sort((a, b) => (interestMap[b.session.id] || 0) - (interestMap[a.session.id] || 0))
      .map((entry) => ({ list: [entry.session], conflictCount: entry.conflictCount }))
  }, [clusters, sortBy, interestMap])

  const timeSortedClusters = useMemo(
    () => clusters.map((cluster) => ({ list: cluster, conflictCount: cluster.length - 1 })),
    [clusters]
  )

  const renderClusters = sortBy === 'interest' ? displayClusters : timeSortedClusters

  return (
    <div className="app">
      <header className="app-header">
        <h1>COSCUP 2026 議程助手</h1>
        <span className="clock">{now.toLocaleTimeString('zh-TW', { hour12: false })}</span>
      </header>

      {fromCache && <div className="banner">⚠️ 目前離線中，顯示的是最後一次快取的議程資料</div>}
      {error && <div className="banner banner-error">載入失敗：{error}</div>}

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
        setBuilding={setBuilding}
        buildings={buildings}
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        myThreshold={myThreshold}
        setMyThreshold={setMyThreshold}
      />

      {loading && <p className="status-line">載入議程中…</p>}
      {!loading && renderClusters.length === 0 && <p className="status-line">沒有符合條件的議程</p>}

      <main className="session-list">
        {renderClusters.map(({ list, conflictCount }) => (
          <SessionCluster
            key={list[0].id}
            cluster={list}
            conflictCount={conflictCount}
            interestMap={interestMap}
            onRate={rate}
            now={now}
          />
        ))}
      </main>
    </div>
  )
}
