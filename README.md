# Waste Schedule Map

An interactive Next.js 14 map application showing today's waste collection schedule, built with Leaflet and a GeoJSON data backend.

## Features

- 🗺️ Interactive Leaflet map with today's waste collection markers
- 📋 Side panel with virtualized street list, sortable by distance from user
- 📍 GPS user location tracking with pulsing marker
- 📥 Export scheduled streets as GeoJSON, KML, GPX, or CSV
- 🔒 Rate limiting (60 req/min per IP) on all API routes
- 📝 Server-side logging via Winston
- 💡 Client-side error reporting via `/api/log`
- 📢 Google AdSense integration (graceful degradation when not configured)
- ⚡ NProgress loading bar and throbber

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the map.

## Configuration

Copy `.env.local.example` to `.env.local` and fill in your AdSense publisher ID (optional):

```
NEXT_PUBLIC_GOOGLE_ADSENSE_PUBLISHER_ID=pub-XXXXXXXXXXXXXXXX
```

Application behaviour (map defaults, colors, rate limits, etc.) is controlled via `config.ts` at the project root.

## Data

GeoJSON data lives at `data/waste_schedules.geojson`. Each feature must have a `waste_schedules` property mapping schedule type names to arrays of German date strings (e.g. `"Di. 27.01.2026"`).

## Testing

```bash
npx jest --testPathPatterns="tests/unit"
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Map:** Leaflet + react-leaflet v4
- **Styling:** Tailwind CSS + system fonts
- **Data fetching:** SWR
- **Virtualisation:** @tanstack/react-virtual
- **Logging:** Winston
- **Testing:** Jest + ts-jest
