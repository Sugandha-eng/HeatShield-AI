# HeatShield AI: heat-aware route planner

Google Maps finds the fastest route. HeatShield finds the coolest.

## Run
```
npm install
npm run selftest   # offline scoring tests
npm run dev        # http://localhost:5173
npm run build      # deploy the dist/ folder to Vercel
```

## Structure
```
src/algorithm/   geo.js, scoring.js, explain.js      (Member 2: pure logic, no network)
src/services/    weather, routing, shadeData, cache,
                 pipeline.js (orchestrator + fallbacks) (Members 2 + 3)
src/components/  MapView, ComparisonCards, ChartPanel (Member 1)
                 ValidationPanel                      (Member 4: demo metrics)
src/config.js    personas, presets, tuning constants
test/selftest.mjs scoring tests                       (Member 3)
```

## How it works
1. OSRM foot profile gives up to 4 candidate routes (alternatives + sideways via-points).
2. Each route is sampled every 50 m. Shade = OSM trees within 30 m + parks. Heat = Open-Meteo feels-like temperature and UV for the chosen hour, scaled by persona.
3. Fastest = lowest time. HeatShield = lowest heat score within 1.5x of fastest time. Water points within 150 m give a small credit.

## Fallbacks (stage safety)
Every API result is cached in localStorage. Run each demo route once on venue Wi-Fi, and it replays offline.
If a server fails: weather uses cache then a hot-day default; routing uses OFFLINE DEMO curves; shade uses SYNTHETIC data. All are flagged by a yellow banner, never silent.

## Tonight checklist
- [ ] Replace PRESETS in src/config.js with real places where the cool route clearly differs
- [ ] Run each preset once online (fills the cache); run "Validation: demo metrics"
- [ ] Test at 8:00 vs 14:00 and with each persona
- [ ] Record a backup demo video
- [ ] Deploy to Vercel and test on the venue network

## Pitch (90 s)
Problem: heatwaves, and delivery workers and the elderly walk exposed. Demo: pick a route, show fastest vs HeatShield (+min, -% heat, water stops). Switch persona and time. Close with limits and roadmap (NDVI, building shadows, city-planner dashboard).
