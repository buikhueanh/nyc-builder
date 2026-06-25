// Pure filtering for the guest browse experience. Kept dependency-free and
// `now`-injectable so the date buckets are deterministically unit-testable.

export const DATE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'This week' },
]

// Local YYYY-MM-DD (avoids UTC off-by-one from toISOString()).
export function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function matchesDate(partyDate, dateKey, now) {
  if (!dateKey || dateKey === 'all') return true
  const today = toYMD(now)
  if (dateKey === 'today') return partyDate === today
  if (dateKey === 'tomorrow') return partyDate === toYMD(addDays(now, 1))
  if (dateKey === 'week') {
    // Inclusive window of today .. today+6. ISO date strings sort lexically.
    return partyDate >= today && partyDate <= toYMD(addDays(now, 6))
  }
  return true
}

/**
 * @param parties array of watch party objects
 * @param filters  { date?: string, team?: string, vibe?: string[] }
 * @param now      Date used as "today" (defaults to current time)
 *
 * Vibe semantics: a party matches when it contains EVERY selected tag (AND),
 * so adding chips narrows results toward a specific vibe.
 */
export function filterParties(parties, filters = {}, now = new Date()) {
  const { date = 'all', team = '', vibe = [] } = filters
  return parties.filter((p) => {
    if (!matchesDate(p.date, date, now)) return false
    if (team && p.teamCheering !== team) return false
    if (vibe.length > 0) {
      const tags = p.vibeTags || []
      if (!vibe.every((v) => tags.includes(v))) return false
    }
    return true
  })
}
