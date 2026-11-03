import { useState } from 'react';
import MapView from './components/MapView.jsx';
import ComparisonCards from './components/ComparisonCards.jsx';
import ChartPanel from './components/ChartPanel.jsx';
import ValidationPanel from './components/ValidationPanel.jsx';
import { analyze } from './services/pipeline.js';
import { PERSONAS, PRESETS, MAP_CENTER } from './config.js';

export default function App() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [personaId, setPersonaId] = useState('pedestrian');
  const [hour, setHour] = useState(Math.min(Math.max(new Date().getHours(), 6), 20));
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showData, setShowData] = useState(false);
  const persona = PERSONAS[personaId];

  function pick(p) {
    setResult(null); setError('');
    if (!start) setStart(p);
    else if (!end) setEnd(p);
    else { setStart(p); setEnd(null); }
  }

  async function run(s = start, e = end) {
    setBusy(true); setError('');
    try { setResult(await analyze({ start: s, end: e, persona, hour })); }
    catch (err) { setResult(null); setError(err.message || 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  function usePreset(p) { setStart(p.start); setEnd(p.end); setResult(null); run(p.start, p.end); }

  return (
    <div className="layout">
      <aside>
        <h1>🌡️ HeatShield AI</h1>
        <p className="sub">Google Maps finds the fastest route. HeatShield finds the coolest.</p>

        <h4>1. Choose route</h4>
        <p className="hint">Click the map for start, then destination, or use a preset:</p>
        {PRESETS.map((p) => <button key={p.name} className="chip" onClick={() => usePreset(p)}>{p.name}</button>)}
        <p className="hint">Start: {start ? start.map((x) => x.toFixed(4)).join(', ') : '—'} · End: {end ? end.map((x) => x.toFixed(4)).join(', ') : '—'}</p>

        <h4>2. Who is travelling?</h4>
        <select value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
          {Object.entries(PERSONAS).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
        </select>

        <h4>3. Time of day: {hour}:00</h4>
        <input type="range" min="6" max="20" value={hour} onChange={(e) => setHour(+e.target.value)} />

        <button className="go" disabled={busy || !start || !end} onClick={() => run()}>
          {busy ? 'Analysing…' : 'Find cool route'}
        </button>

        {error && <div className="alert err">{error}</div>}
        {result?.warnings.map((w) => <div key={w} className="alert warn">{w}</div>)}

        {result && (
          <>
            <ComparisonCards result={result} />
            <p className="explain">{result.text}</p>
            <ChartPanel result={result} />
            <div className="meta">
              Weather: {result.weather.temp}°C, feels {result.weather.feelsLike}°C, UV {result.weather.uv} ({result.weather.source}) ·
              Shade data: {result.data.trees.length} trees, {result.data.water.length} water pts ({result.data.source})
            </div>
            <label className="hint"><input type="checkbox" checked={showData} onChange={(e) => setShowData(e.target.checked)} /> Show trees & water points</label>
          </>
        )}

        <ValidationPanel persona={persona} hour={hour} />

        <details className="panel">
          <summary>Limitations (be upfront with judges)</summary>
          <ul>
            <li>Shade = mapped OSM trees/parks only; building shadows not modelled.</li>
            <li>Park size is approximated; water points depend on OSM completeness.</li>
            <li>Weather is area-wide, not per street. Scores are relative, not clinical.</li>
            <li>Public routing/Overpass servers are rate-limited: results are cached.</li>
            <li>Next: satellite NDVI/land-surface temperature, building shadows, live heat sensors.</li>
          </ul>
        </details>
      </aside>
      <MapView center={MAP_CENTER} start={start} end={end} result={result} showData={showData} onPick={pick} />
    </div>
  );
}
