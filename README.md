# ⚽ WatchParty NYC

A Luma/Meetup-style web app for discovering **World Cup 2026 watch parties across NYC**.
Hosts (restaurants, bars, households) drop a pin on a live map; guests browse, filter by
team/date/vibe, click a pin, and RSVP. The cultural angle: NYC is a city of immigrants — this
maps where each community gathers to cheer.

Built with React + Vite, Tailwind, Leaflet/OpenStreetMap, and a small Express backend that
streams an AI "vibe" line from Google Gemini over Server-Sent Events.

## Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Map:** Leaflet + OpenStreetMap (no key), geocoding via Nominatim
- **State:** React `useState` + `localStorage` (no database)
- **AI:** Express backend → Gemini `gemini-2.5-flash`, streamed token-by-token via SSE

## Setup

```bash
npm install
```

Create a `.env` in the repo root (already gitignored) and paste your key:

```
GEMINI_API_KEY=your_key_here     # free key: https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-2.5-flash
PORT=8787
```

> The key stays **server-side only** (never `VITE_`-prefixed, so it's never bundled into the
> browser). The app works **without** a key too — "Generate My Vibe" falls back to a local
> templated sentence so the demo never breaks.

## Run

```bash
npm run dev      # starts Vite (web) + Express (API) together
```

Open the printed Vite URL (e.g. http://localhost:5173). Vite proxies `/api` → the Express
server on `PORT`.

Run them separately if you prefer:

```bash
npm run dev:web  # Vite only
npm run dev:api  # Express only
```

## Test

```bash
npm test         # Vitest unit tests (utils, components, server SSE parsing)
npm run build    # production build
```

## Project layout
```
server/        Express API: POST /api/vibe streams Gemini → SSE (gemini.js is unit-tested)
src/
  components/  HeroBar, MapView, FilterBar, SidePanel, HostModal, RSVPModal, VibeTag
  data/        teams, fixtures, neighborhoods, vibeTags, seedData
  utils/       localStorage, capacity, filters, geocode, vibeGenerator (SSE client)
```
