import { cacheGet, cacheSet, fetchJson, sleep } from './cache.js';
import { viaPoint, haversine, pathLength } from '../algorithm/geo.js';

// Pedestrian profile (the OSRM demo server only does cars). Public + rate limited.
const FOOT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';
const ll = (p) => `${p[1].toFixed(5)},${p[0].toFixed(5)}`;

async function osrm(points, alternatives) {
  const url = `${FOOT}/${points.map(ll).join(';')}?overview=full&geometries=geojson&alternatives=${alternatives}`;
  const j = await fetchJson(url);
  if (j.code !== 'Ok') throw new Error(j.code);
  return j.routes.map((r) => ({
    coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distance: r.distance,
  }));
}

function isDuplicate(a, b) {
  if (Math.abs(a.distance - b.distance) > 40) return false;
  const ma = a.coords[Math.floor(a.coords.length / 2)];
  const mb = b.coords[Math.floor(b.coords.length / 2)];
  return haversine(ma, mb) < 40;
}

// Offline fallback: curved fake routes so the UI never dies on stage.
function syntheticRoutes(start, end) {
  return [0, 0.18, -0.18].map((k) => {
    const via = viaPoint(start, end, k);
    const coords = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30, u = 1 - t;
      coords.push([
        u * u * start[0] + 2 * u * t * via[0] + t * t * end[0],
        u * u * start[1] + 2 * u * t * via[1] + t * t * end[1],
      ]);
    }
    return { coords, distance: pathLength(coords), synthetic: true };
  });
}

// Returns { routes: [{id, coords, distance}], synthetic: bool, source }
export async function getCandidates(start, end) {
  const key = `rt_${start.map((x) => x.toFixed(4))}_${end.map((x) => x.toFixed(4))}`;
  const cached = cacheGet(key);
  if (cached) return { routes: cached, synthetic: false, source: 'cached' };

  try {
    let all = await osrm([start, end], 'true');
    for (const k of [0.2, -0.2]) {               // force variety via sideways waypoints
      await sleep(1100);                          // be polite to the public server
      try { all = all.concat(await osrm([start, viaPoint(start, end, k), end], 'false')); } catch { /* skip */ }
    }
    const uniq = [];
    for (const r of all) if (!uniq.some((u) => isDuplicate(u, r))) uniq.push(r);
    const routes = uniq.slice(0, 4).map((r, i) => ({ ...r, id: `r${i}` }));
    cacheSet(key, routes);
    return { routes, synthetic: false, source: 'live' };
  } catch {
    const routes = syntheticRoutes(start, end).map((r, i) => ({ ...r, id: `s${i}` }));
    return { routes, synthetic: true, source: 'offline' };
  }
}
