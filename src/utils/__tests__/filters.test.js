import { describe, it, expect } from 'vitest'
import { filterParties, toYMD } from '../filters.js'

const NOW = new Date('2026-06-26T12:00:00') // local "today"

const parties = [
  { id: 'a', date: '2026-06-26', teamCheering: 'Argentina', vibeTags: ['rowdy', 'food-provided'] },
  { id: 'b', date: '2026-06-27', teamCheering: 'Mexico', vibeTags: ['rowdy'] },
  { id: 'c', date: '2026-06-28', teamCheering: 'Argentina', vibeTags: ['chill', 'family-friendly'] },
  { id: 'd', date: '2026-07-10', teamCheering: 'Brazil', vibeTags: ['cultural'] },
]

const ids = (list) => list.map((p) => p.id)

describe('toYMD', () => {
  it('formats local date as YYYY-MM-DD', () => {
    expect(toYMD(NOW)).toBe('2026-06-26')
  })
})

describe('filterParties — date buckets', () => {
  it('all → everything', () => {
    expect(ids(filterParties(parties, { date: 'all' }, NOW))).toEqual(['a', 'b', 'c', 'd'])
  })
  it('today → only matching today', () => {
    expect(ids(filterParties(parties, { date: 'today' }, NOW))).toEqual(['a'])
  })
  it('tomorrow → only matching tomorrow', () => {
    expect(ids(filterParties(parties, { date: 'tomorrow' }, NOW))).toEqual(['b'])
  })
  it('week → today through today+6 inclusive (excludes far-future)', () => {
    expect(ids(filterParties(parties, { date: 'week' }, NOW))).toEqual(['a', 'b', 'c'])
  })
})

describe('filterParties — team', () => {
  it('filters by exact team', () => {
    expect(ids(filterParties(parties, { team: 'Argentina' }, NOW))).toEqual(['a', 'c'])
  })
  it('empty team → no team constraint', () => {
    expect(ids(filterParties(parties, { team: '' }, NOW))).toHaveLength(4)
  })
})

describe('filterParties — vibe (AND semantics)', () => {
  it('single tag matches any party with it', () => {
    expect(ids(filterParties(parties, { vibe: ['rowdy'] }, NOW))).toEqual(['a', 'b'])
  })
  it('multiple tags require ALL present', () => {
    expect(ids(filterParties(parties, { vibe: ['rowdy', 'food-provided'] }, NOW))).toEqual(['a'])
  })
  it('no vibe tags → no vibe constraint', () => {
    expect(ids(filterParties(parties, { vibe: [] }, NOW))).toHaveLength(4)
  })
})

describe('filterParties — combined + empty result', () => {
  it('combines date + team + vibe', () => {
    const out = filterParties(
      parties,
      { date: 'week', team: 'Argentina', vibe: ['chill'] },
      NOW,
    )
    expect(ids(out)).toEqual(['c'])
  })
  it('returns [] when nothing matches', () => {
    expect(filterParties(parties, { team: 'Japan' }, NOW)).toEqual([])
  })
})
