// localStorage cache so the demo survives flaky Wi-Fi / rate limits.
export function cacheGet(key) {
  try { const v = localStorage.getItem('hs_' + key); return v ? JSON.parse(v) : null; } catch { return null; }
}
export function cacheSet(key, value) {
  try { localStorage.setItem('hs_' + key, JSON.stringify(value)); } catch { /* quota: ignore */ }
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function fetchJson(url, opts = {}, timeoutMs = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
}
