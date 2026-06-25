import { describe, it, expect } from 'vitest'
import { getCapacityStatus } from '../capacity.js'

describe('getCapacityStatus', () => {
  it('reports spots open below 0.5 ratio', () => {
    expect(getCapacityStatus(0, 10).level).toBe('open')
    expect(getCapacityStatus(4, 10).level).toBe('open')
  })

  it('reports filling up at exactly 0.5 and below 0.9', () => {
    expect(getCapacityStatus(5, 10).level).toBe('filling') // boundary 0.5
    expect(getCapacityStatus(8, 10).level).toBe('filling')
  })

  it('reports almost full at exactly 0.9 and above', () => {
    expect(getCapacityStatus(9, 10).level).toBe('full') // boundary 0.9
    expect(getCapacityStatus(10, 10).level).toBe('full')
    expect(getCapacityStatus(20, 10).level).toBe('full') // over capacity
  })

  it('does not divide by zero for 0 capacity', () => {
    expect(getCapacityStatus(0, 0).level).toBe('open')
  })

  it('returns a label, emoji and color', () => {
    const s = getCapacityStatus(0, 10)
    expect(s.label).toBe('Spots open')
    expect(s.emoji).toBe('🟢')
    expect(s.color).toMatch(/^#/)
  })
})
