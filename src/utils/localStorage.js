const EVENTS_KEY = 'watchparty_events'
const RSVPS_KEY = 'watchparty_rsvps'

export function saveEvent(event) {
  const existing = getEvents()
  const updated = [...existing, event]
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated))
  return updated
}

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY)) || []
  } catch {
    return []
  }
}

// Replace the full events list (used when mutating an existing event, e.g.
// incrementing rsvpCount, since we never edit/delete otherwise).
export function setEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  return events
}

export function saveRSVP(rsvp) {
  const existing = getRSVPs()
  const updated = [...existing, rsvp]
  localStorage.setItem(RSVPS_KEY, JSON.stringify(updated))
  return updated
}

export function getRSVPs() {
  try {
    return JSON.parse(localStorage.getItem(RSVPS_KEY)) || []
  } catch {
    return []
  }
}
