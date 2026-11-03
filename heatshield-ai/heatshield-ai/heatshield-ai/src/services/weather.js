import { cacheGet, cacheSet, fetchJson } from './cache.js';

// Open-Meteo: free, no key. Returns values for the chosen hour (0-23).
export async function getWeather([lat, lng], hour) {
  const key = `wx_${lat.toFixed(2)}_${lng.toFixed(2)}_${hour}`;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index&forecast_days=1&timezone=auto`;
    const j = await fetchJson(url);
    const i = Math.min(hour, j.hourly.time.length - 1);
    const w = {
      temp: j.hourly.temperature_2m[i],
      humidity: j.hourly.relative_humidity_2m[i],
      feelsLike: j.hourly.apparent_temperature[i],
      uv: j.hourly.uv_index[i] ?? 0,
      source: 'live',
    };
    cacheSet(key, w);
    return w;
  } catch {
    const c = cacheGet(key);
    if (c) return { ...c, source: 'cached' };
    // Hot-afternoon default so the demo never breaks.
    return { temp: 41, humidity: 30, feelsLike: 43, uv: 9, source: 'fallback' };
  }
}
