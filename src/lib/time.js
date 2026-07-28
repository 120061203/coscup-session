export function formatTimeRange(start, end) {
  const fmt = (d) =>
    d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fmt(start)}–${fmt(end)}`
}

export function formatDayLabel(dayKey) {
  const d = new Date(`${dayKey}T00:00:00+08:00`)
  const weekday = d.toLocaleDateString('zh-TW', { weekday: 'short', timeZone: 'Asia/Taipei' })
  const [, m, day] = dayKey.split('-')
  return `${m}/${day} (${weekday})`
}

export function overlaps(a, b) {
  return a.start < b.end && b.start < a.end
}

export function sessionStatus(session, now) {
  if (now < session.start) return 'upcoming'
  if (now > session.end) return 'past'
  return 'ongoing'
}

export function minutesUntil(session, now) {
  return Math.round((session.start.getTime() - now.getTime()) / 60000)
}

// Day keys are plain "YYYY-MM-DD" strings from the COSCUP API. Compare against
// Asia/Taipei's calendar date (not the device's local timezone) so "today"
// means the event's today, regardless of where the device is set.
export function todayKeyTaipei(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(date)
}
