import { describe, it, expect } from 'vitest'

// Milestone 0 sanity check: toolchain wiring works end-to-end.
describe('toolchain sanity', () => {
  it('runs vitest with jsdom', () => {
    expect(1 + 1).toBe(2)
    expect(typeof window).toBe('object')
    expect(typeof localStorage).toBe('object')
  })
})
