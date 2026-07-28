export default function FilterBar({
  onCollapse,
  view,
  setView,
  timeFilter,
  setTimeFilter,
  day,
  setDay,
  days,
  track,
  setTrack,
  tracks,
  building,
  onToggleBuilding,
  buildings,
  floor,
  onToggleFloor,
  floors,
  search,
  setSearch,
  sortBy,
  setSortBy,
  myThreshold,
  setMyThreshold,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-top">
        <div className="tabs view-tabs">
          <button className={view === 'browse' ? 'active' : ''} onClick={() => setView('browse')}>
            總覽
          </button>
          <button className={view === 'my' ? 'active' : ''} onClick={() => setView('my')}>
            我的行程
          </button>
        </div>
        <button type="button" className="filter-collapse-btn" onClick={onCollapse} aria-label="收合篩選">
          ▴
        </button>
      </div>

      <div className="tabs day-tabs">
        <button className={day === 'all' ? 'active' : ''} onClick={() => setDay('all')}>
          全部日期
        </button>
        {days.map((d) => (
          <button key={d.key} className={day === d.key ? 'active' : ''} onClick={() => setDay(d.key)}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="tabs building-tabs">
        <button className={building.length === 0 ? 'active' : ''} onClick={() => building.forEach(onToggleBuilding)}>
          全部地點
        </button>
        {buildings.map((b) => (
          <button key={b} className={building.includes(b) ? 'active' : ''} onClick={() => onToggleBuilding(b)}>
            {b}
          </button>
        ))}
      </div>
      {building.length > 1 && <p className="filter-hint">地點為「或」邏輯：符合任一棟即顯示</p>}

      {floors.length > 1 && (
        <div className="tabs floor-tabs">
          <button className={floor.length === 0 ? 'active' : ''} onClick={() => floor.forEach(onToggleFloor)}>
            全部樓層
          </button>
          {floors.map((f) => (
            <button key={f} className={floor.includes(f) ? 'active' : ''} onClick={() => onToggleFloor(f)}>
              {f}F
            </button>
          ))}
        </div>
      )}

      {view === 'browse' && (
        <>
          <div className="tabs time-tabs">
            <button className={timeFilter === 'all' ? 'active' : ''} onClick={() => setTimeFilter('all')}>
              全部時段
            </button>
            <button className={timeFilter === 'now' ? 'active' : ''} onClick={() => setTimeFilter('now')}>
              現在進行中
            </button>
            <button className={timeFilter === 'soon' ? 'active' : ''} onClick={() => setTimeFilter('soon')}>
              即將開始
            </button>
          </div>

          <div className="filter-row">
            <input
              className="search-input"
              type="search"
              placeholder="搜尋標題／講者／地點"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={track} onChange={(e) => setTrack(e.target.value)}>
              <option value="all">全部議程軌</option>
              {tracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="time">依時間排序</option>
              <option value="interest">依興趣程度排序</option>
            </select>
          </div>
        </>
      )}

      {view === 'my' && (
        <div className="filter-row">
          <label className="threshold-label">
            只顯示評分 ≥ {myThreshold} 分
            <input
              type="range"
              min="1"
              max="5"
              value={myThreshold}
              onChange={(e) => setMyThreshold(Number(e.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  )
}
