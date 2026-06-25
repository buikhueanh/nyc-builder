import { useEffect, useState } from 'react'

export default function RSVPModal({ party, onClose, onConfirm }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!party) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setName('')
        setEmail('')
        setDone(false)
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [party, onClose])

  if (!party) return null

  const close = () => {
    setName('')
    setEmail('')
    setDone(false)
    onClose()
  }

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    onConfirm({ party, guestName: name.trim(), guestEmail: email.trim() })
    setDone(true)
  }

  const field =
    'w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:border-grass-green focus:outline-none'

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card-surface p-6 shadow-2xl">
        {done ? (
          <div className="text-center">
            <div className="text-4xl">🎉</div>
            <h2 className="mt-2 font-display text-3xl tracking-wide text-grass-green">
              You&apos;re in!
            </h2>
            <p className="mt-2 font-mono text-sm text-night-black/70">
              {party.hostName} · {party.date} · {party.matchFixture}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-5 w-full rounded-lg bg-grass-green py-2.5 font-display text-lg tracking-wide text-pitch-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="mb-1 font-mono text-xs uppercase tracking-wide text-night-black/50">
              RSVP · {party.matchFixture}
            </div>
            <h2 className="mb-4 font-display text-3xl tracking-wide text-night-black">
              {party.hostName}
            </h2>

            <label htmlFor="rsvpName" className="mb-1 block font-mono text-xs uppercase text-night-black/60">
              Name
            </label>
            <input
              id="rsvpName"
              name="name"
              autoComplete="name"
              className={`${field} mb-3`}
              placeholder="Linh"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="rsvpEmail" className="mb-1 block font-mono text-xs uppercase text-night-black/60">
              Email
            </label>
            <input
              id="rsvpEmail"
              name="email"
              type="email"
              autoComplete="email"
              className={`${field} mb-5`}
              placeholder="linh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-lg border border-border-subtle py-2.5 text-sm font-medium text-night-black/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] rounded-lg bg-grass-green py-2.5 font-display text-lg tracking-wide text-pitch-white shadow active:scale-[0.98]"
              >
                Reserve My Spot
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
