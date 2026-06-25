export default function HeroBar({ onHostClick }) {
  return (
    <header className="stadium-texture flex items-center justify-between gap-4 px-5 py-4 shadow-md sm:px-8">
      <div>
        <h1 className="font-display text-4xl leading-none tracking-wide text-pitch-white sm:text-5xl">
          ⚽ WatchParty NYC
        </h1>
        <p className="font-mono text-xs text-pitch-white/80 sm:text-sm">
          World Cup 2026 watch parties · Flex your culture
        </p>
      </div>
      <button
        type="button"
        onClick={onHostClick}
        className="shrink-0 rounded-lg bg-amber-goal px-4 py-2.5 font-display text-lg tracking-wide text-night-black shadow transition hover:brightness-105 active:scale-95 sm:text-xl"
      >
        Host a Watch Party
      </button>
    </header>
  )
}
