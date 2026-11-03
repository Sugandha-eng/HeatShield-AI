// Run: npm run selftest. Checks the scoring logic with no network.
import assert from 'node:assert';
import { scoreRoute, pickRoutes } from '../src/algorithm/scoring.js';
import { samplePath, pathLength } from '../src/algorithm/geo.js';
import { PERSONAS } from '../src/config.js';

const line = (lat) => Array.from({ length: 21 }, (_, i) => [lat, 75.85 + i * 0.0005]); // ~1 km
const sp = samplePath(line(30.9), 50);
assert.ok(Math.abs(sp.reduce((a, s) => a + s.len, 0) - pathLength(line(30.9))) < 1, 'sample lengths sum to path length');

const trees = line(30.9006).flatMap((p) => [p, [p[0] + 0.00005, p[1]], [p[0], p[1] + 0.00005], [p[0] - 0.00005, p[1]]]);
const data = { trees, parks: [], water: [[30.9006, 75.855]] };
const weather = { feelsLike: 43, uv: 9, temp: 41, humidity: 30 };
const open = scoreRoute({ id: 'open', coords: line(30.9) }, weather, { trees: [], parks: [], water: [] }, PERSONAS.pedestrian);
const shady = scoreRoute({ id: 'shady', coords: line(30.9006), distance: pathLength(line(30.9006)) * 1.1 }, weather, data, PERSONAS.pedestrian); // 10% detour
assert.ok(shady.score < open.score, 'shaded route must score lower');
const pick = pickRoutes([open, shady]);
assert.strictEqual(pick.cool.id, 'shady');
assert.ok(pick.compare.reductionPct > 20);

const cool = scoreRoute({ id: 'a', coords: line(30.9) }, { feelsLike: 20, uv: 1, temp: 20, humidity: 50 }, data, PERSONAS.pedestrian);
assert.strictEqual(cool.score, 0, 'no heat load in cool weather');
console.log('All selftests passed. Reduction on test case:', pick.compare.reductionPct.toFixed(0) + '%');
