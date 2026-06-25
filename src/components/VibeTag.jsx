// Colored vibe chip. rowdy → red, chill → blue, everything else → amber.
const COLORS = {
  rowdy: 'bg-vibe-red/15 text-vibe-red border-vibe-red/30',
  chill: 'bg-vibe-blue/15 text-vibe-blue border-vibe-blue/30',
}
const DEFAULT = 'bg-amber-goal/15 text-amber-700 border-amber-goal/40'

export default function VibeTag({ tag }) {
  const cls = COLORS[tag] || DEFAULT
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-xs lowercase ${cls}`}
    >
      {tag}
    </span>
  )
}
