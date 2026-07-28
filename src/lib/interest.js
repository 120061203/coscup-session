import seed from '../data/interestSeed.json'

const STORAGE_KEY = 'coscup2026-interest'

export function loadInterestMap(sessionIds) {
  let stored
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    stored = null
  }

  if (!stored) {
    stored = { ...seed }
  }

  let changed = !localStorage.getItem(STORAGE_KEY)
  for (const id of sessionIds) {
    if (!(id in stored)) {
      stored[id] = seed[id] ?? 0
      changed = true
    }
  }

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }

  return stored
}

export function saveInterest(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}
