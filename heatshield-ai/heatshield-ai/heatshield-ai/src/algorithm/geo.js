// Small geometry helpers. Points are [lat, lng].
const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;

export function haversine(a, b) {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathLength(pts) {
  let t = 0;
  for (let i = 1; i < pts.length; i++) t += haversine(pts[i - 1], pts[i]);
  return t;
}

// Split a path into samples of ~step metres: [{from, to, len}]
export function samplePath(pts, step = 50) {
  const out = [];
  let prev = pts[0];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const d = haversine(a, b);
    if (d === 0) continue;
    let pos = 0;
    while (acc + (d - pos) >= step) {
      const t = (pos + (step - acc)) / d;
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      out.push({ from: prev, to: p, len: step });
      prev = p;
      pos += step - acc;
      acc = 0;
    }
    acc += d - pos;
  }
  if (acc > 1) out.push({ from: prev, to: pts[pts.length - 1], len: acc });
  return out;
}

export function boundsOf(pts, pad = 0.003) {
  let s = 90, w = 180, n = -90, e = -180;
  for (const [lat, lng] of pts) {
    s = Math.min(s, lat); n = Math.max(n, lat);
    w = Math.min(w, lng); e = Math.max(e, lng);
  }
  return { s: s - pad, w: w - pad, n: n + pad, e: e + pad };
}

// Point offset sideways from the start-end midpoint (k = fraction of trip length, +/-).
export function viaPoint(start, end, k) {
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const cos = Math.cos(rad(midLat));
  const dLat = end[0] - start[0];
  const dLng = (end[1] - start[1]) * cos;
  return [midLat + k * -dLng, midLng + (k * dLat) / cos];
}
