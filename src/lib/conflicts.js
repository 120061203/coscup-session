// Sessions must already be sorted by start time.
//
// Groups sessions that start at the exact same instant into one cluster, so a
// "same time slot, multiple rooms" choice is rendered side by side. This is
// deliberately NOT a transitive interval-overlap merge: with many parallel
// rooms running back-to-back sessions all day, a sweep-line union of any
// overlap chains almost the entire schedule into one giant cluster. Grouping
// by identical start time matches how a conference schedule is actually read
// ("what's on at 10:00?") and keeps cluster sizes bounded to the number of
// rooms.
export function groupByOverlap(sessions) {
  const clusters = []
  let current = []
  let currentStart = null

  for (const session of sessions) {
    if (current.length === 0 || session.start.getTime() === currentStart) {
      current.push(session)
      currentStart = session.start.getTime()
    } else {
      clusters.push(current)
      current = [session]
      currentStart = session.start.getTime()
    }
  }
  if (current.length) clusters.push(current)

  return clusters
}
