import { useState } from 'react';
import { PRESETS } from '../config.js';
import { analyze } from '../services/pipeline.js';

// Runs every demo preset and tabulates metrics: use these numbers in your pitch.
export default function ValidationPanel({ persona, hour }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true); setRows([]);
    const out = [];
    for (const p of PRESETS) {
      try {
        const r = await analyze({ start: p.start, end: p.end, persona, hour });
        out.push({ name: p.name, extra: r.compare.extraMin, red: r.compare.reductionPct, water: r.compare.waterStops, flag: r.warnings.length ? '⚠' : '✓' });
      } catch (e) { out.push({ name: p.name, err: e.message }); }
      setRows([...out]);
    }
    setBusy(false);
  }
  const ok = rows.filter((r) => !r.err);
  const avg = ok.length ? ok.reduce((a, r) => a + r.red, 0) / ok.length : 0;

  return (
    <details className="panel">
      <summary>Validation: demo metrics</summary>
      <button onClick={run} disabled={busy}>{busy ? 'Running…' : 'Run all presets'}</button>
      {rows.length > 0 && (
        <table>
          <thead><tr><th>Route</th><th>+min</th><th>−heat</th><th>💧</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => r.err
              ? <tr key={r.name}><td>{r.name}</td><td colSpan="4">{r.err}</td></tr>
              : <tr key={r.name}><td>{r.name}</td><td>{r.extra.toFixed(1)}</td><td>{r.red.toFixed(0)}%</td><td>{r.water}</td><td>{r.flag}</td></tr>)}
          </tbody>
        </table>
      )}
      {ok.length > 0 && <p><b>Average heat reduction: {avg.toFixed(0)}%</b> (⚠ = fallback data was used)</p>}
    </details>
  );
}
