import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveEvent,
  getEvents,
  setEvents,
  saveRSVP,
  getRSVPs,
} from '../localStorage.js'

beforeEach(() => {
  localStorage.clear()
})

describe('events storage', () => {
  it('returns [] when nothing stored', () => {
    expect(getEvents()).toEqual([])
  })

  it('round-trips saved events and appends', () => {
    saveEvent({ id: 'a' })
    saveEvent({ id: 'b' })
    expect(getEvents().map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('setEvents replaces the full list', () => {
    saveEvent({ id: 'a', rsvpCount: 0 })
    setEvents([{ id: 'a', rsvpCount: 1 }])
    expect(getEvents()).toEqual([{ id: 'a', rsvpCount: 1 }])
  })

  it('falls back to [] on corrupt JSON', () => {
    localStorage.setItem('watchparty_events', '{not valid json')
    expect(getEvents()).toEqual([])
  })
})

describe('rsvp storage', () => {
  it('returns [] when nothing stored', () => {
    expect(getRSVPs()).toEqual([])
  })

  it('round-trips saved rsvps', () => {
    saveRSVP({ id: 'r1', guestName: 'Linh' })
    expect(getRSVPs()).toEqual([{ id: 'r1', guestName: 'Linh' }])
  })

  it('falls back to [] on corrupt JSON', () => {
    localStorage.setItem('watchparty_rsvps', 'broken')
    expect(getRSVPs()).toEqual([])
  })
})
