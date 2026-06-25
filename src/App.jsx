import { useEffect, useMemo, useState } from 'react'
import HeroBar from './components/HeroBar.jsx'
import FilterBar from './components/FilterBar.jsx'
import MapView from './components/MapView.jsx'
import SidePanel from './components/SidePanel.jsx'
import HostModal from './components/HostModal.jsx'
import RSVPModal from './components/RSVPModal.jsx'
import { getEvents, setEvents, saveEvent, saveRSVP } from './utils/localStorage.js'
import { filterParties } from './utils/filters.js'
import { streamVibeDescription } from './utils/vibeGenerator.js'
import { seedWatchParties } from './data/seedData.js'

const DEFAULT_FILTERS = { date: 'all', team: '', vibe: [] }

export default function App() {
  const [parties, setParties] = useState([])
  const [selectedParty, setSelectedParty] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [hostOpen, setHostOpen] = useState(false)
  const [rsvpParty, setRsvpParty] = useState(null)

  // Load from localStorage; seed on first run so the demo map is populated.
  useEffect(() => {
    const stored = getEvents()
    if (stored.length === 0) {
      setEvents(seedWatchParties)
      setParties(seedWatchParties)
    } else {
      setParties(stored)
    }
  }, [])

  const filtered = useMemo(() => filterParties(parties, filters), [parties, filters])
  const availableTeams = useMemo(
    () => [...new Set(parties.map((p) => p.teamCheering))],
    [parties],
  )

  const handleAddParty = (party) => {
    const updated = saveEvent(party)
    setParties(updated)
    setHostOpen(false)
    setFilters(DEFAULT_FILTERS) // ensure the new pin is visible
    setSelectedParty(party) // confirmation: open its panel
  }

  const handleRsvp = ({ party, guestName, guestEmail }) => {
    saveRSVP({
      id: crypto.randomUUID(),
      watchPartyId: party.id,
      guestName,
      guestEmail,
      registeredAt: Date.now(),
    })
    // Increment the count and persist the events list.
    const updated = parties.map((p) =>
      p.id === party.id ? { ...p, rsvpCount: p.rsvpCount + 1 } : p,
    )
    setParties(updated)
    setEvents(updated)
    // Keep the open SidePanel in sync with the new count.
    setSelectedParty((cur) => (cur && cur.id === party.id ? { ...cur, rsvpCount: cur.rsvpCount + 1 } : cur))
  }

  return (
    <div className="flex h-full flex-col">
      <HeroBar onHostClick={() => setHostOpen(true)} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        availableTeams={availableTeams}
        resultCount={filtered.length}
      />
      <div className="relative flex-1">
        <MapView parties={filtered} onPinClick={setSelectedParty} />
        {filtered.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-6">
            <div className="pointer-events-auto rounded-xl bg-card-surface/95 px-6 py-5 text-center shadow-lg ring-1 ring-border-subtle">
              <p className="font-display text-2xl tracking-wide text-night-black">
                No watch parties found
              </p>
              <p className="mt-1 font-mono text-sm text-night-black/60">
                Be the first to host one! ⚽
              </p>
            </div>
          </div>
        )}
      </div>

      <SidePanel
        party={selectedParty}
        onClose={() => setSelectedParty(null)}
        onRsvp={(party) => setRsvpParty(party)}
      />

      <HostModal
        open={hostOpen}
        onClose={() => setHostOpen(false)}
        onSubmit={handleAddParty}
        onGenerateVibe={streamVibeDescription}
      />

      <RSVPModal
        party={rsvpParty}
        onClose={() => setRsvpParty(null)}
        onConfirm={handleRsvp}
      />
    </div>
  )
}
