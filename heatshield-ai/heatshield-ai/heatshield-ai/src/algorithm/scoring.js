// Rule-based heat exposure scoring (pure functions, no network).
import { haversine, samplePath, pathLength } from './geo.js';
import { SAMPLE_STEP_M, TREE_RADIUS_M, WATER_RADIUS_M, MAX_EXTRA_TIME } from '../config.js';

const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

// Heat load 0..1.5 from "feels like" temperature (25C = comfortable, 45C = extreme).
export const heatLoad = (feelsLike) => clamp((feelsLike - 25) / 20, 0, 1.5);

export function heatColor(level) {
  // level 0 (cool) .. 1 (severe) -> green..red
  return `hsl(${Math.round((1 - clamp(level)) * 120)}, 85%, 45%)`;
}

export function scoreRoute(route, weather, data, persona) {
  const load = heatLoad(weather.feelsLike);
  const uvF = clamp(weather.uv / 11);
  const waterSeen = new Set();

  const samples = samplePath(route.coords, SAMPLE_STEP_M).map((s) => {
    const mid = [(s.from[0] + s.to[0]) / 2, (s.from[1] + s.to[1]) / 2];
    let trees = 0;
    for (const t of data.trees) {
      if (Math.abs(t[0] - mid[0]) < 0.0004 && Math.abs(t[1] - mid[1]) < 0.0004 && haversine(mid, t) <= TREE_RADIUS_M) trees++;
    }
    const inPark = data.parks.some((p) => haversine(mid, p.center) <= p.radius);
    const shade = clamp(trees * 0.25 + (inPark ? 0.6 : 0));
    const exposure = 1 - 0.85 * shade;                       // 1 = fully exposed
    const heat = load * persona.heatSensitivity * exposure * (1 + 0.5 * uvF);
    data.water.forEach((w, i) => { if (haversine(mid, w) <= WATER_RADIUS_M) waterSeen.add(i); });
    return { ...s, shade, exposure, heat, level: clamp(exposure * Math.min(1, load)) };
  });

  const raw = samples.reduce((a, s) => a + s.heat * (s.len / 1000), 0);
  const waterStops = waterSeen.size;
  const credit = Math.min(0.2, waterStops * 0.05 * persona.waterWeight);
  const distance = route.distance ?? pathLength(route.coords);
  return {
    id: route.id,
    coords: route.coords,
    synthetic: !!route.synthetic,
    samples,
    distance,
    minutes: distance / persona.speed / 60,
    score: raw * (1 - credit),
    shadedPct: samples.length ? (samples.filter((s) => s.shade >= 0.5).length / samples.length) * 100 : 0,
    exposedKm: samples.filter((s) => s.exposure > 0.7).reduce((a, s) => a + s.len, 0) / 1000,
    waterStops,
  };
}

// Fastest = min time. HeatShield = min heat score among routes <= MAX_EXTRA_TIME x slower.
export function pickRoutes(scored) {
  const fast = scored.reduce((a, b) => (b.minutes < a.minutes ? b : a));
  const allowed = scored.filter((r) => r.minutes <= fast.minutes * MAX_EXTRA_TIME + 1);
  const cool = allowed.reduce((a, b) => (b.score < a.score ? b : a));
  const same = cool.id === fast.id;
  return {
    fast, cool, same,
    compare: {
      extraMin: cool.minutes - fast.minutes,
      reductionPct: fast.score > 0 ? Math.max(0, (1 - cool.score / fast.score) * 100) : 0,
      waterStops: cool.waterStops,
      shadedPct: cool.shadedPct,
    },
  };
}
