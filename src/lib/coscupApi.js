import { parseLocation } from './location'

const API_URL = 'https://coscup.org/2026/api/session'
const CACHE_KEY = 'coscup2026-sessions-cache-v1'

function normalize(dayKey, raw) {
  const room = raw.room?.['zh-hant'] || raw.room?.en || ''
  return {
    id: raw.id,
    day: dayKey,
    start: new Date(raw.start),
    end: new Date(raw.end),
    room,
    location: parseLocation(room),
    track: raw.track?.name?.['zh-hant'] || raw.track?.name?.en || '',
    type: raw.zh?.type || raw.en?.type || '',
    titleZh: raw.zh?.title || raw.en?.title || '(無標題)',
    titleEn: raw.en?.title || raw.zh?.title || '',
    descZh: raw.zh?.describe || '',
    descEn: raw.en?.describe || '',
    speakers: (raw.speakers || []).map((s) => s.zh?.name || s.en?.name).filter(Boolean),
    tags: raw.tags || [],
    uri: raw.uri,
    language: raw.language || '',
  }
}

function flatten(data) {
  const sessions = []
  for (const [dayKey, list] of Object.entries(data)) {
    for (const raw of list) {
      sessions.push(normalize(dayKey, raw))
    }
  }
  sessions.sort((a, b) => a.start - b.start)
  return sessions
}

export async function fetchSessions() {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    return { sessions: flatten(data), fromCache: false }
  } catch (err) {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      return { sessions: flatten(JSON.parse(cached)), fromCache: true }
    }
    throw err
  }
}
