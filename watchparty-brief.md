# ⚽ WatchParty NYC — Project Brief
> Hackathon MVP · Builders NYC · June 25, 2026
> Theme: Flex Your Culture

---

## 1. What We're Building

A Luma/Meetup-style web app tailored for **World Cup 2026 watch party discovery in NYC** — and open to any major sports event in the future.

Two sides:
- **Hosts** (restaurants, bars, households) submit their watch party and appear as a pin on a live map
- **Guests** browse the map, filter by team/date/vibe, click a pin, and RSVP

The cultural angle: NYC is a city of immigrants. Vietnam, Pakistan, Brazil, Mexico — most people here cheer for a country *other than* the one they live in. This app maps where those communities gather, and makes it easy to find your people.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React (Vite) | Fast scaffold, Claude Code handles well |
| Styling | Tailwind CSS | Utility-first, no separate CSS files needed |
| Map | Leaflet + OpenStreetMap | No API key required, simple to implement |
| State | React useState + localStorage | No backend needed for demo |
| AI Feature | Anthropic Claude API (claude-sonnet-4-6) | In-browser call for vibe generation |
| No backend | All data in localStorage | Keeps scope tight for 1-hour build |

---

## 3. Visual Design Direction

### Palette
```
--grass-green:    #1a7a1a   /* map accent, CTA buttons */
--pitch-white:    #f8f8f2   /* background */
--night-black:    #0d0d0d   /* primary text */
--amber-goal:     #f5a623   /* highlights, tags, pins */
--card-surface:   #ffffff   /* cards, panels */
--border-subtle:  #e2e2e2   /* dividers */
--vibe-red:       #e63946   /* rowdy/loud vibe tag */
--vibe-blue:      #457b9d   /* chill/quiet vibe tag */
```

### Typography
- **Display:** `Bebas Neue` (Google Fonts) — scoreboard energy for headings
- **Body:** `Inter` — clean, readable for form fields and cards
- **Accent/Tags:** `Space Mono` — cultural detail lines, vibe tags

### Signature Design Element
A **stadium-texture hero bar** at the top — dark green background with subtle grass-line pattern (CSS stripes), white Bebas Neue title. Feels like a matchday broadcast banner, not a generic event app.

### Overall Vibe
Matchday broadcast meets neighborhood bulletin board. Bold, warm, culturally textured. Not corporate. Not generic startup template.

---

## 4. App Structure

```
/src
  App.jsx                  — root, manages global state
  /components
    HeroBar.jsx            — top banner with app name + tagline
    MapView.jsx            — Leaflet map with all watch party pins
    SidePanel.jsx          — slides in on pin click, shows details + RSVP
    HostModal.jsx          — full submission form for hosts
    FilterBar.jsx          — date / team / vibe filters for guest browse
    RSVPModal.jsx          — simple RSVP confirmation modal
    VibeTag.jsx            — reusable colored tag component
  /data
    seedData.js            — 4–5 hardcoded watch parties to populate map on load
    teams.js               — list of World Cup 2026 teams with flag emojis
    neighborhoods.js       — list of NYC neighborhoods for dropdown
  /utils
    vibeGenerator.js       — Claude API call to generate cultural vibe line
    localStorage.js        — helpers: saveEvent, getEvents, saveRSVP, getRSVPs
```

---

## 5. Data Model

### Watch Party Object
```javascript
{
  id: "uuid",
  // Host Info
  hostType: "restaurant" | "household",       // determines icon on map
  hostName: "Ahmed's Place",
  // Location
  address: "123 Atlantic Ave, Brooklyn, NY",
  neighborhood: "Boerum Hill",
  locationType: "restaurant" | "bar" | "home" | "rooftop" | "community_space",
  coordinates: { lat: 40.6872, lng: -73.9418 },
  // Event Details
  date: "2026-06-26",
  matchTime: "3:00 PM",
  matchFixture: "Argentina vs France",        // selected from fixture list
  teamCheering: "Argentina",                  // single team, flag emoji shown
  capacity: 5 | 10 | 20 | 50,               // rough buckets
  // Culture
  culturalTheme: "Pakistani household, karahi on the stove, very loud",
  vibeDescription: "🇵🇰 Karachi energy meets Buenos Aires passion — bring your appetite and your voice",  // AI generated
  vibeTags: ["rowdy", "food-provided", "family-friendly"],  // multi-select
  // Contact
  contactInfo: "ahmed@email.com or WhatsApp +1...",   // optional
  // Meta
  rsvpCount: 0,
  createdAt: timestamp
}
```

### RSVP Object
```javascript
{
  id: "uuid",
  watchPartyId: "uuid",
  guestName: "Linh",
  guestEmail: "linh@email.com",
  registeredAt: timestamp
}
```

---

## 6. User Flows

### Host Flow
```
Click "Host a Watch Party" (CTA in nav)
  → Modal opens
  → Step 1: Pick host type
      [🍽️ Restaurant / Bar]  [🏠 Household / Pop-up]
  → Step 2: Fill form
      - Host name
      - Address (text input — geocoded to lat/lng via free Nominatim API)
      - Location type (dropdown)
      - Date + time (date picker + fixture selector)
      - Team cheering for (flag picker — searchable dropdown)
      - Capacity (4 options: ~5 / ~10 / ~20 / 50+)
      - Vibe tags (multi-select chips)
      - Cultural theme (single free-text line, 100 char max)
      - Contact info (optional)
  → Click "Generate My Vibe" button
      → Calls Claude API with culturalTheme + teamCheering + hostType
      → Returns 1-sentence vibe description
      → Shows preview: "Your vibe: 🇵🇰 Karachi energy meets Buenos Aires passion..."
  → Click "Add to Map"
      → Pin appears on map immediately
      → Confirmation screen: "You're on the map!" with their pin highlighted
      → Save to localStorage
```

### Guest Flow
```
Land on app
  → See map with all watch party pins (colored by team)
  → FilterBar at top: Date | Team (flag dropdown) | Vibe tags
  → Apply filters → pins update
  → Click any pin
      → SidePanel slides in from right
      → Shows: host name, type badge, neighborhood, match, team flag,
               capacity indicator, cultural theme, AI vibe line, vibe tags
      → Click "I'm In →" button
          → RSVPModal opens
          → Enter name + email
          → Click "Reserve My Spot"
          → Confirmation: "You're in! Ahmed's Place · June 26 · Argentina vs France"
          → rsvpCount increments on the pin
          → Save to localStorage
```

---

## 7. Component Details

### MapView.jsx
- Leaflet map centered on NYC (lat: 40.7128, lng: -74.0060), zoom 12
- Custom pin icons: 🍽️ for restaurant, 🏠 for household — colored by team color
- On pin click → call `onPinClick(watchParty)` to open SidePanel
- Filter props passed in: filtered array of watch parties

### SidePanel.jsx
- Fixed right panel, slides in with CSS transition
- Shows all watch party details
- Capacity indicator: green "Spots open" / yellow "Filling up" / red "Full"
- Close button (X) top right
- "I'm In →" CTA button at bottom

### HostModal.jsx
- Multi-step feel but single scrollable form is fine for MVP
- Team picker: flag emoji + country name, searchable
- "Generate My Vibe" button triggers Claude API call
- Show loading spinner during API call
- Vibe preview shown before final submit

### FilterBar.jsx
- Horizontally scrollable on mobile
- Date filter: today / tomorrow / this week / all
- Team filter: flag emoji dropdown, matches teams in current seed data
- Vibe filter: chip multi-select

---

## 8. AI Feature: Vibe Generator

### What it does
Takes host's raw cultural theme input and generates a punchy, emoji-rich 1-sentence description for their watch party card.

### API Call
```javascript
// utils/vibeGenerator.js

export async function generateVibeDescription({ culturalTheme, teamCheering, hostType }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Note: API key is handled by the environment — do not hardcode
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are writing a punchy, warm, culturally specific 1-sentence vibe description for a World Cup watch party listing.

Host type: ${hostType}
Team cheering for: ${teamCheering}
Cultural theme (host's own words): "${culturalTheme}"

Write ONE sentence only. Max 20 words. Include 1-2 relevant flag or food emojis. 
Make it feel alive and specific — not generic. Capture the culture and the energy.
No quotes around the output. Just the sentence.

Examples of good output:
"🇵🇰 Karachi energy meets Buenos Aires passion — bring your appetite and your voice"
"🇻🇳 Hanoian family vibes, three generations deep, very superstitious about changing seats"
"🇧🇷 Samba on the speakers, caipirinhas on the table, tears of joy guaranteed"`
        }
      ]
    })
  });

  const data = await response.json();
  return data.content[0].text.trim();
}
```

### UX
- Button: `"✨ Generate My Vibe"` — disabled until culturalTheme is filled
- Loading state: spinner + `"Capturing your culture..."`
- Result shown in a styled preview box before form submit
- Host can regenerate if they don't like it

---

## 9. Seed Data (for demo)

Pre-load 5 watch parties covering different cultures and neighborhoods:

```javascript
// data/seedData.js
export const seedWatchParties = [
  {
    id: "1",
    hostType: "restaurant",
    hostName: "Pho Saigon Brooklyn",
    address: "456 Court St, Brooklyn, NY",
    neighborhood: "Carroll Gardens",
    locationType: "restaurant",
    coordinates: { lat: 40.6782, lng: -73.9942 },
    date: "2026-06-26",
    matchTime: "3:00 PM",
    matchFixture: "France vs Morocco",
    teamCheering: "France",
    capacity: 20,
    culturalTheme: "Vietnamese restaurant cheering France, pho and bánh mì, bilingual crowd",
    vibeDescription: "🇻🇳🇫🇷 Hanoi roots, Paris heart — pho bowls and baguettes watching les Bleus together",
    vibeTags: ["food-provided", "family-friendly"],
    contactInfo: "",
    rsvpCount: 8,
    createdAt: Date.now()
  },
  {
    id: "2",
    hostType: "household",
    hostName: "Ahmed's Rooftop",
    address: "78 Atlantic Ave, Brooklyn, NY",
    neighborhood: "Boerum Hill",
    locationType: "rooftop",
    coordinates: { lat: 40.6872, lng: -73.9840 },
    date: "2026-06-26",
    matchTime: "3:00 PM",
    matchFixture: "Argentina vs England",
    teamCheering: "Argentina",
    capacity: 10,
    culturalTheme: "Pakistani household, karahi on the stove, cheering Argentina because we always have",
    vibeDescription: "🇵🇰 Karachi energy meets Buenos Aires passion — karahi on the stove, goals in the heart",
    vibeTags: ["rowdy", "food-provided", "byob"],
    contactInfo: "WhatsApp Ahmed",
    rsvpCount: 6,
    createdAt: Date.now()
  },
  {
    id: "3",
    hostType: "restaurant",
    hostName: "La Esquina Queens",
    address: "82-10 Roosevelt Ave, Jackson Heights, NY",
    neighborhood: "Jackson Heights",
    locationType: "bar",
    coordinates: { lat: 40.7484, lng: -73.8831 },
    date: "2026-06-27",
    matchTime: "6:00 PM",
    matchFixture: "Mexico vs USA",
    teamCheering: "Mexico",
    capacity: 50,
    culturalTheme: "Mexican sports bar, tacos, the whole neighborhood comes out",
    vibeDescription: "🇲🇽 Roosevelt Ave goes full stadium — tacos, cervezas, and the loudest block in Queens",
    vibeTags: ["rowdy", "food-provided"],
    contactInfo: "",
    rsvpCount: 31,
    createdAt: Date.now()
  },
  {
    id: "4",
    hostType: "household",
    hostName: "Priya's Living Room",
    address: "210 Vanderbilt Ave, Brooklyn, NY",
    neighborhood: "Prospect Heights",
    locationType: "home",
    coordinates: { lat: 40.6773, lng: -73.9692 },
    date: "2026-06-26",
    matchTime: "3:00 PM",
    matchFixture: "Brazil vs Germany",
    teamCheering: "Brazil",
    capacity: 5,
    culturalTheme: "Indian household cheering Brazil, chai and samosas, very chill watching",
    vibeDescription: "🇮🇳🇧🇷 Mumbai living room energy — chai, samosas, and samba on mute",
    vibeTags: ["chill", "food-provided", "family-friendly"],
    contactInfo: "priya@email.com",
    rsvpCount: 3,
    createdAt: Date.now()
  },
  {
    id: "5",
    hostType: "restaurant",
    hostName: "Habesha Ethiopian Bar",
    address: "731 Flatbush Ave, Brooklyn, NY",
    neighborhood: "Flatbush",
    locationType: "bar",
    coordinates: { lat: 40.6501, lng: -73.9496 },
    date: "2026-06-28",
    matchTime: "12:00 PM",
    matchFixture: "Morocco vs Senegal",
    teamCheering: "Morocco",
    capacity: 20,
    culturalTheme: "Pan-African watch party, injera and tej, whole diaspora welcome",
    vibeDescription: "🌍 Pan-African pride night in Flatbush — injera, tej, and one roof for the whole diaspora",
    vibeTags: ["family-friendly", "food-provided", "cultural"],
    contactInfo: "",
    rsvpCount: 14,
    createdAt: Date.now()
  }
];
```

---

## 10. localStorage Helpers

```javascript
// utils/localStorage.js

const EVENTS_KEY = 'watchparty_events';
const RSVPS_KEY = 'watchparty_rsvps';

export function saveEvent(event) {
  const existing = getEvents();
  const updated = [...existing, event];
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
}

export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveRSVP(rsvp) {
  const existing = getRSVPs();
  const updated = [...existing, rsvp];
  localStorage.setItem(RSVPS_KEY, JSON.stringify(updated));
}

export function getRSVPs() {
  try {
    return JSON.parse(localStorage.getItem(RSVPS_KEY)) || [];
  } catch {
    return [];
  }
}
```

---

## 11. World Cup 2026 Fixtures (Subset for Demo)

```javascript
// data/fixtures.js
export const upcomingFixtures = [
  { id: "f1", match: "Argentina vs France", date: "2026-06-26", time: "3:00 PM" },
  { id: "f2", match: "Brazil vs Germany",   date: "2026-06-26", time: "3:00 PM" },
  { id: "f3", match: "France vs Morocco",   date: "2026-06-26", time: "6:00 PM" },
  { id: "f4", match: "Mexico vs USA",       date: "2026-06-27", time: "6:00 PM" },
  { id: "f5", match: "Morocco vs Senegal",  date: "2026-06-28", time: "12:00 PM" },
  { id: "f6", match: "England vs Spain",    date: "2026-06-28", time: "3:00 PM" },
  { id: "f7", match: "South Korea vs Japan",date: "2026-06-29", time: "6:00 PM" },
];
```

---

## 12. Teams List (for flag picker)

```javascript
// data/teams.js
export const teams = [
  { name: "Argentina",    flag: "🇦🇷", color: "#74ACDF" },
  { name: "Brazil",       flag: "🇧🇷", color: "#009C3B" },
  { name: "France",       flag: "🇫🇷", color: "#0055A4" },
  { name: "Germany",      flag: "🇩🇪", color: "#000000" },
  { name: "England",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#CF091B" },
  { name: "Spain",        flag: "🇪🇸", color: "#AA151B" },
  { name: "Mexico",       flag: "🇲🇽", color: "#006847" },
  { name: "USA",          flag: "🇺🇸", color: "#B22234" },
  { name: "Morocco",      flag: "🇲🇦", color: "#C1272D" },
  { name: "Senegal",      flag: "🇸🇳", color: "#00853F" },
  { name: "South Korea",  flag: "🇰🇷", color: "#CD2E3A" },
  { name: "Japan",        flag: "🇯🇵", color: "#BC002D" },
  { name: "Portugal",     flag: "🇵🇹", color: "#006600" },
  { name: "Netherlands",  flag: "🇳🇱", color: "#FF6600" },
  { name: "Colombia",     flag: "🇨🇴", color: "#FCD116" },
];
```

---

## 13. NYC Neighborhoods Dropdown

```javascript
// data/neighborhoods.js
export const nycNeighborhoods = [
  "Astoria", "Boerum Hill", "Bronx", "Brooklyn Heights",
  "Bushwick", "Carroll Gardens", "Chelsea", "Crown Heights",
  "East Village", "Flatbush", "Flushing", "Forest Hills",
  "Greenpoint", "Harlem", "Inwood", "Jackson Heights",
  "Jamaica", "Lower East Side", "Midtown", "Park Slope",
  "Prospect Heights", "Queens Village", "Red Hook",
  "Ridgewood", "Sunnyside", "Sunset Park", "Williamsburg",
  "Woodside"
];
```

---

## 14. Geocoding (Address → Coordinates)

Use free **Nominatim API** (OpenStreetMap) — no API key needed:

```javascript
// utils/geocode.js
export async function geocodeAddress(address) {
  const encoded = encodeURIComponent(address + ", New York City");
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
  
  const response = await fetch(url, {
    headers: { "User-Agent": "WatchPartyNYC/1.0" }  // Nominatim requires this
  });
  
  const data = await response.json();
  
  if (data.length === 0) {
    // Fallback to NYC center if geocoding fails
    return { lat: 40.7128, lng: -74.0060 };
  }
  
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}
```

---

## 15. Key UX Details

- **Map pins** are colored by the team the host is cheering for (use team color from teams.js)
- **Capacity indicator logic:**
  - rsvpCount / capacity < 0.5 → 🟢 "Spots open"
  - rsvpCount / capacity < 0.9 → 🟡 "Filling up"
  - rsvpCount / capacity >= 0.9 → 🔴 "Almost full"
- **SidePanel** slides in from right on desktop, bottom sheet on mobile
- **FilterBar** resets to "All" by default — show all pins on load
- **"Host a Watch Party"** button always visible in top nav
- **Empty state** on filtered map: "No watch parties found — be the first to host one!"

---

## 16. What NOT to Build (Scope Boundaries)

- ❌ User authentication / login
- ❌ Backend server or database
- ❌ Email sending / real notifications
- ❌ Photo uploads
- ❌ Editing or deleting a watch party after submit
- ❌ Payment or ticketing
- ❌ Real-time updates (polling is fine if time allows, not required)

---

## 17. Demo Script (3 minutes)

1. **Open app** — map loads with 5 culturally diverse pins across NYC
2. **Show filter** — filter by "Argentina" → only Argentina watch parties show
3. **Click a pin** — SidePanel slides in, show Ahmed's Rooftop details and AI vibe line
4. **RSVP flow** — click "I'm In", fill name/email, confirm → rsvpCount updates
5. **Host flow** — click "Host a Watch Party", fill form as a Vietnamese restaurant, type cultural theme, hit "Generate My Vibe" → AI returns vibe sentence live
6. **Submit** — new pin appears on the map instantly
7. **Close with pitch:** *"We're from Hanoi and Karachi. Our teams aren't in the Cup — but we still show up. This app is for every immigrant fan who finds their people anyway."*

---

## 18. Build Order (60 minutes)

| Time | Task |
|---|---|
| 0–10 min | Scaffold Vite + React + Tailwind, install Leaflet, render map with seed data pins |
| 10–20 min | SidePanel component — click pin → details slide in |
| 20–30 min | FilterBar — filter pins by team/date/vibe |
| 30–42 min | HostModal — full form, geocoding, add pin to map on submit |
| 42–52 min | AI vibe generator — Claude API call, loading state, preview |
| 52–57 min | RSVP modal — name/email form, rsvpCount update, localStorage save |
| 57–60 min | Polish: responsive check, pin colors by team, empty state |
