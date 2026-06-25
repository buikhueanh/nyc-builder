import { useEffect, useRef, useState } from 'react'
import VibeTag from './VibeTag.jsx'
import { getCapacityStatus } from '../utils/capacity.js'
import { getTeamFlag } from '../data/teams.js'

const HOST_TYPE_LABEL = {
  restaurant: '🍽️ Restaurant / Bar',
  household: '🏠 Household / Pop-up',
}

export default function SidePanel({ party, onClose, onRsvp }) {
  const open = Boolean(party)
  // Keep the last party around so content stays visible during the slide-out.
  const lastRef = useRef(party)
  if (party) lastRef.current = party
  const p = party || lastRef.current

  // Move focus out before the panel becomes aria-hidden, otherwise a focused
  // descendant would be hidden from assistive tech (and warn in the console).
  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    onClose()
  }

  // Escape to close.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && handleClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const cap = p ? getCapacityStatus(p.rsvpCount, p.capacity) : null

  const [copied, setCopied] = useState(false)
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(p.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked — select the text so the user can copy manually.
      const el = document.getElementById('wp-address-text')
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[1000] bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Watch party details"
        aria-hidden={!open}
        className={`fixed z-[1001] flex flex-col bg-card-surface shadow-2xl transition-transform duration-300 ease-out
          inset-x-0 bottom-0 h-[85vh] rounded-t-2xl
          md:inset-y-0 md:left-auto md:right-0 md:bottom-auto md:h-full md:w-full md:max-w-md md:rounded-t-none ${
          open
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
        }`}
      >
        {p && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
              <div>
                <div className="font-mono text-xs uppercase tracking-wide text-night-black/50">
                  {HOST_TYPE_LABEL[p.hostType]} · {p.neighborhood}
                </div>
                <h2 className="mt-1 font-display text-3xl tracking-wide text-night-black">
                  {p.hostName}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-night-black/50 hover:bg-pitch-white hover:text-night-black"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Match */}
              <div className="flex items-center gap-3 rounded-lg bg-pitch-white p-3">
                <span className="text-3xl">{getTeamFlag(p.teamCheering)}</span>
                <div>
                  <div className="font-semibold text-night-black">{p.matchFixture}</div>
                  <div className="font-mono text-xs text-night-black/60">
                    {p.date} · {p.matchTime} · cheering {p.teamCheering}
                  </div>
                </div>
              </div>

              {/* Address (copy-paste) */}
              {p.address && (
                <div className="rounded-lg border border-border-subtle p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wide text-night-black/50">
                      📍 Address
                    </span>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="rounded-md border border-border-subtle px-2 py-0.5 font-mono text-xs text-grass-green hover:bg-pitch-white"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p id="wp-address-text" className="select-all text-sm text-night-black">
                    {p.address}
                  </p>
                </div>
              )}

              {/* Capacity */}
              <div
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: cap.color, color: cap.color }}
              >
                <span>{cap.emoji}</span>
                <span>{cap.label}</span>
                <span className="ml-auto font-mono text-xs text-night-black/50">
                  {p.rsvpCount}/{p.capacity} in
                </span>
              </div>

              {/* Vibe line */}
              {p.vibeDescription && (
                <div className="rounded-lg border border-amber-goal/40 bg-amber-goal/10 p-3 font-mono text-sm text-night-black">
                  {p.vibeDescription}
                </div>
              )}

              {/* Cultural theme */}
              {p.culturalTheme && (
                <div>
                  <div className="mb-1 font-mono text-xs uppercase tracking-wide text-night-black/50">
                    The scene
                  </div>
                  <p className="text-sm text-night-black/80">{p.culturalTheme}</p>
                </div>
              )}

              {/* Vibe tags */}
              {p.vibeTags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.vibeTags.map((t) => (
                    <VibeTag key={t} tag={t} />
                  ))}
                </div>
              )}

              {/* Contact */}
              {p.contactInfo && (
                <div className="font-mono text-xs text-night-black/60">📇 {p.contactInfo}</div>
              )}
            </div>

            <div className="border-t border-border-subtle p-5">
              <button
                type="button"
                onClick={() => onRsvp(p)}
                className="w-full rounded-lg bg-grass-green py-3 font-display text-xl tracking-wide text-pitch-white shadow transition hover:brightness-110 active:scale-[0.98]"
              >
                I&apos;m In →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
