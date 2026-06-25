import { useEffect, useState } from 'react'
import { upcomingFixtures } from '../data/fixtures.js'
import { teams as ALL_TEAMS } from '../data/teams.js'
import { nycNeighborhoods } from '../data/neighborhoods.js'
import { VIBE_TAGS } from '../data/vibeTags.js'
import { geocodeAddress } from '../utils/geocode.js'

const LOCATION_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'home', label: 'Home' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'community_space', label: 'Community space' },
]
const CAPACITIES = [
  { value: 5, label: '~5' },
  { value: 10, label: '~10' },
  { value: 20, label: '~20' },
  { value: 50, label: '50+' },
]

const EMPTY = {
  hostType: 'restaurant',
  hostName: '',
  address: '',
  neighborhood: nycNeighborhoods[0],
  locationType: 'restaurant',
  fixtureId: '',
  teamCheering: '',
  capacity: 10,
  vibeTags: [],
  culturalTheme: '',
  contactInfo: '',
}

export default function HostModal({ open, onClose, onSubmit, onGenerateVibe }) {
  const [form, setForm] = useState(EMPTY)
  const [vibe, setVibe] = useState('')
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Escape closes the modal (and resets the form).
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setForm(EMPTY)
        setVibe('')
        setError('')
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const toggleVibe = (tag) =>
    update({
      vibeTags: form.vibeTags.includes(tag)
        ? form.vibeTags.filter((t) => t !== tag)
        : [...form.vibeTags, tag],
    })

  const reset = () => {
    setForm(EMPTY)
    setVibe('')
    setError('')
  }
  const close = () => {
    reset()
    onClose()
  }

  const handleGenerate = async () => {
    if (!form.culturalTheme.trim() || generating) return
    setGenerating(true)
    setVibe('')
    try {
      const final = await onGenerateVibe(
        {
          culturalTheme: form.culturalTheme,
          teamCheering: form.teamCheering,
          hostType: form.hostType,
        },
        (partial) => setVibe(partial), // live streaming updates
      )
      setVibe(final)
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.hostName.trim() || !form.address.trim() || !form.fixtureId || !form.teamCheering) {
      setError('Please fill host name, address, fixture, and team.')
      return
    }
    setSubmitting(true)
    try {
      const fixture = upcomingFixtures.find((f) => f.id === form.fixtureId)
      const coordinates = await geocodeAddress(form.address)
      const party = {
        id: crypto.randomUUID(),
        hostType: form.hostType,
        hostName: form.hostName.trim(),
        address: form.address.trim(),
        neighborhood: form.neighborhood,
        locationType: form.locationType,
        coordinates,
        date: fixture.date,
        matchTime: fixture.time,
        matchFixture: fixture.match,
        teamCheering: form.teamCheering,
        capacity: form.capacity,
        culturalTheme: form.culturalTheme.trim(),
        vibeDescription: vibe.trim(),
        vibeTags: form.vibeTags,
        contactInfo: form.contactInfo.trim(),
        rsvpCount: 0,
        createdAt: Date.now(),
      }
      onSubmit(party)
      reset()
    } finally {
      setSubmitting(false)
    }
  }

  const field = 'w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-grass-green focus:outline-none'
  const labelCls = 'mb-1 block font-mono text-xs uppercase tracking-wide text-night-black/60'

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="my-6 w-full max-w-lg rounded-2xl bg-card-surface shadow-2xl">
        {/* Header */}
        <div className="stadium-texture flex items-center justify-between rounded-t-2xl px-5 py-4">
          <h2 className="font-display text-2xl tracking-wide text-pitch-white">
            Host a Watch Party
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full p-1 text-pitch-white/80 hover:bg-white/10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Host type */}
          <div>
            <span className={labelCls}>Host type</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'restaurant', l: '🍽️ Restaurant / Bar' },
                { v: 'household', l: '🏠 Household / Pop-up' },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => update({ hostType: o.v })}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    form.hostType === o.v
                      ? 'border-grass-green bg-grass-green/10 text-grass-green'
                      : 'border-border-subtle text-night-black/70'
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* Host name */}
          <div>
            <label htmlFor="hostName" className={labelCls}>Host name</label>
            <input
              id="hostName"
              name="hostName"
              autoComplete="off"
              className={field}
              placeholder="Pho Saigon Brooklyn"
              value={form.hostName}
              onChange={(e) => update({ hostName: e.target.value })}
            />
          </div>

          {/* Address + neighborhood */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="address" className={labelCls}>Address</label>
              <input
                id="address"
                name="address"
                autoComplete="off"
                className={field}
                placeholder="456 Court St, Brooklyn"
                value={form.address}
                onChange={(e) => update({ address: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="neighborhood" className={labelCls}>Neighborhood</label>
              <select
                id="neighborhood"
                name="neighborhood"
                className={field}
                value={form.neighborhood}
                onChange={(e) => update({ neighborhood: e.target.value })}
              >
                {nycNeighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location type + fixture */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="locationType" className={labelCls}>Location type</label>
              <select
                id="locationType"
                name="locationType"
                className={field}
                value={form.locationType}
                onChange={(e) => update({ locationType: e.target.value })}
              >
                {LOCATION_TYPES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fixture" className={labelCls}>Match</label>
              <select
                id="fixture"
                name="fixture"
                className={field}
                value={form.fixtureId}
                onChange={(e) => update({ fixtureId: e.target.value })}
              >
                <option value="">Pick a fixture…</option>
                {upcomingFixtures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.match} · {f.date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team + capacity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="team" className={labelCls}>Cheering for</label>
              <select
                id="team"
                name="team"
                className={field}
                value={form.teamCheering}
                onChange={(e) => update({ teamCheering: e.target.value })}
              >
                <option value="">Pick a team…</option>
                {ALL_TEAMS.map((t) => (
                  <option key={t.name} value={t.name}>{t.flag} {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={labelCls}>Capacity</span>
              <div className="flex gap-1.5">
                {CAPACITIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => update({ capacity: c.value })}
                    className={`flex-1 rounded-lg border py-2 text-sm transition ${
                      form.capacity === c.value
                        ? 'border-grass-green bg-grass-green/10 text-grass-green'
                        : 'border-border-subtle text-night-black/70'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vibe tags */}
          <div>
            <span className={labelCls}>Vibe tags</span>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleVibe(tag)}
                  aria-pressed={form.vibeTags.includes(tag)}
                  className={`rounded-full border px-2.5 py-1 font-mono text-xs lowercase transition ${
                    form.vibeTags.includes(tag)
                      ? 'border-amber-goal bg-amber-goal text-night-black'
                      : 'border-border-subtle text-night-black/60'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Cultural theme */}
          <div>
            <label htmlFor="culturalTheme" className={labelCls}>
              Cultural theme ({form.culturalTheme.length}/100)
            </label>
            <textarea
              id="culturalTheme"
              name="culturalTheme"
              maxLength={100}
              rows={2}
              className={field}
              placeholder="Vietnamese restaurant cheering France, pho and bánh mì, bilingual crowd"
              value={form.culturalTheme}
              onChange={(e) => update({ culturalTheme: e.target.value })}
            />
          </div>

          {/* Generate vibe */}
          <div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!form.culturalTheme.trim() || generating}
              className="w-full rounded-lg border border-amber-goal bg-amber-goal/10 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-goal/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? '✨ Capturing your culture…' : '✨ Generate My Vibe'}
            </button>
            {(vibe || generating) && (
              <div className="mt-2 min-h-[2.5rem] rounded-lg border border-amber-goal/40 bg-amber-goal/10 p-3 font-mono text-sm text-night-black">
                {vibe}
                {generating && <span className="animate-pulse">▌</span>}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="contactInfo" className={labelCls}>Contact (optional)</label>
            <input
              id="contactInfo"
              name="contactInfo"
              autoComplete="off"
              className={field}
              placeholder="email or WhatsApp"
              value={form.contactInfo}
              onChange={(e) => update({ contactInfo: e.target.value })}
            />
          </div>

          {error && <p className="text-sm font-medium text-vibe-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-grass-green py-3 font-display text-xl tracking-wide text-pitch-white shadow transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? 'Adding…' : 'Add to Map →'}
          </button>
        </form>
      </div>
    </div>
  )
}
