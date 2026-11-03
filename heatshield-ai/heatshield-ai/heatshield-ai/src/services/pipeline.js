// Orchestrator: weather + routes + shade data -> scored result.
import { getWeather } from './weather.js';
import { getCandidates } from './routing.js';
import { getShadeData } from './shadeData.js';
import { scoreRoute, pickRoutes } from '../algorithm/scoring.js';
import { explain } from '../algorithm/explain.js';
import { boundsOf, haversine } from '../algorithm/geo.js';
import { MAX_ROUTE_KM } from '../config.js';

export async function analyze({ start, end, persona, hour }) {
  if (!start || !end) throw new Error('Pick a start and a destination first.');
  const dist = haversine(start, end);
  if (dist < 100) throw new Error('Start and destination are too close. Pick points further apart.');
  if (dist > MAX_ROUTE_KM * 1000) throw new Error(`Trip is longer than ${MAX_ROUTE_KM} km. Pick a shorter one for this demo.`);

  const warnings = [];
  const [weather, cands] = await Promise.all([getWeather(start, hour), getCandidates(start, end)]);
  if (weather.source !== 'live') warnings.push(`Weather: using ${weather.source} values.`);
  if (cands.synthetic) warnings.push('Routing server unreachable: showing OFFLINE DEMO routes (not real roads).');

  const bounds = boundsOf(cands.routes.flatMap((r) => r.coords));
  const data = await getShadeData(bounds);
  if (data.source === 'synthetic') warnings.push('Shade data: Overpass unreachable, using SYNTHETIC sample data.');
  else if (data.trees.length < 20) warnings.push('Few mapped trees in this area: shade scores are low-confidence.');

  const scored = cands.routes.map((r) => scoreRoute(r, weather, data, persona));
  const picked = pickRoutes(scored);
  return { weather, data, scored, ...picked, warnings, text: explain(picked, weather, persona) };
}
