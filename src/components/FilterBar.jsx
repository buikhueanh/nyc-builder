import { DATE_FILTERS } from '../utils/filters.js'
import { teams as ALL_TEAMS } from '../data/teams.js'
import { VIBE_TAGS } from '../data/vibeTags.js'

export default function FilterBar({ filters, onChange, availableTeams, resultCount }) {
  const set = (patch) => onChange({ ...filters, ...patch })

  const toggleVibe = (tag) => {
    const has = filters.vibe.includes(tag)
    set({ vibe: has ? filters.vibe.filter((v) => v !== tag) : [...filters.vibe, tag] })
  }

  const teamOptions = ALL_TEAMS.filter((t) => availableTeams.includes(t.name))
  const isDefault =
    filters.date === 'all' && filters.team === '' && filters.vibe.length === 0

  return (
    <div className="flex items-center gap-3 overflow-x-auto border-b border-border-subtle bg-card-surface px-4 py-3 sm:px-8">
      {/* Date segmented control */}
      <div className="flex shrink-0 rounded-lg bg-pitch-white p-1">
        {DATE_FILTERS.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => set({ date: d.key })}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filters.date === d.key
                ? 'bg-grass-green text-pitch-white shadow'
                : 'text-night-black/60 hover:text-night-black'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Team dropdown */}
      <select
        id="team-filter"
        name="team"
        aria-label="Filter by team"
        value={filters.team}
        onChange={(e) => set({ team: e.target.value })}
        className="shrink-0 rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-sm"
      >
        <option value="">🌍 All teams</option>
        {teamOptions.map((t) => (
          <option key={t.name} value={t.name}>
            {t.flag} {t.name}
          </option>
        ))}
      </select>

      {/* Vibe chips */}
      <div className="flex shrink-0 gap-1.5">
        {VIBE_TAGS.map((tag) => {
          const active = filters.vibe.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleVibe(tag)}
              aria-pressed={active}
              className={`rounded-full border px-2.5 py-1 font-mono text-xs lowercase transition ${
                active
                  ? 'border-amber-goal bg-amber-goal text-night-black'
                  : 'border-border-subtle text-night-black/60 hover:border-amber-goal'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 pl-2">
        <span className="font-mono text-xs text-night-black/50">{resultCount} parties</span>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange({ date: 'all', team: '', vibe: [] })}
            className="font-mono text-xs text-grass-green underline hover:no-underline"
          >
            reset
          </button>
        )}
      </div>
    </div>
  )
}
