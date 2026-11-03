import { cacheGet, cacheSet, fetchJson } from './cache.js';

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function parse(elements) {
  const trees = [], water = [], parks = [];
  for (const e of elements) {
    const t = e.tags || {};
    const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
    if (lat == null) continue;
    if (t.natural === 'tree') trees.push([lat, lon]);
    else if (t.amenity === 'drinking_water' || t.man_made === 'water_tap') water.push([lat, lon]);
    else if (t.leisure === 'park' || t.landuse === 'forest') parks.push({ center: [lat, lon], radius: 80 }); // approximate
  }
  return { trees, water, parks };
}

// Deterministic synthetic data (clearly labelled "synthetic" in the UI).
function synthetic({ s, w, n, e }) {
  let seed = Math.floor((s + w) * 1e5) >>> 0;
  const rnd = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pt = () => [s + rnd() * (n - s), w + rnd() * (e - w)];
  const parks = Array.from({ length: 3 }, () => ({ center: pt(), radius: 90 }));
  const trees = [];
  parks.forEach((p) => { for (let i = 0; i < 60; i++) trees.push([p.center[0] + (rnd() - 0.5) * 0.0016, p.center[1] + (rnd() - 0.5) * 0.0016]); });
  for (let i = 0; i < 120; i++) trees.push(pt());
  return { trees, parks, water: Array.from({ length: 5 }, pt) };
}

export async function getShadeData(b) {
  const key = `ov_${[b.s, b.w, b.n, b.e].map((x) => x.toFixed(3))}`;
  const cached = cacheGet(key);
  if (cached) return { ...cached, source: 'cached' };

  const bb = `${b.s},${b.w},${b.n},${b.e}`;
  const q = `[out:json][timeout:20];(node["natural"="tree"](${bb});node["amenity"="drinking_water"](${bb});` +
    `node["man_made"="water_tap"](${bb});way["leisure"="park"](${bb});way["landuse"="forest"](${bb}););out center 4000;`;
  for (const ep of ENDPOINTS) {
    try {
      const j = await fetchJson(`${ep}?data=${encodeURIComponent(q)}`, {}, 20000);
      const d = parse(j.elements);
      cacheSet(key, d);
      return { ...d, source: 'live' };
    } catch { /* try next */ }
  }
  return { ...synthetic(b), source: 'synthetic' };
}
