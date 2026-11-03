import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { heatColor } from '../algorithm/scoring.js';

export default function MapView({ center, start, end, result, showData, onPick }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null), pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    map.current = L.map(el.current).setView(center, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap contributors',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    map.current.on('click', (e) => pickRef.current([e.latlng.lat, e.latlng.lng]));
    return () => map.current.remove();
  }, []);

  useEffect(() => {
    const g = layer.current;
    g.clearLayers();
    const pin = (p, color, label) =>
      p && L.circleMarker(p, { radius: 9, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 }).bindTooltip(label, { permanent: true, direction: 'top' }).addTo(g);
    pin(start, '#2563eb', 'Start');
    pin(end, '#111827', 'End');

    if (result) {
      if (showData) {
        result.data.trees.slice(0, 800).forEach((t) => L.circleMarker(t, { radius: 2, color: '#15803d', weight: 0, fillOpacity: 0.6 }).addTo(g));
        result.data.water.forEach((w) => L.circleMarker(w, { radius: 6, color: '#0369a1', fillColor: '#38bdf8', fillOpacity: 1 }).bindTooltip('Water').addTo(g));
      }
      if (!result.same) L.polyline(result.fast.coords, { color: '#6b7280', weight: 4, dashArray: '8 8' }).bindTooltip('Fastest').addTo(g);
      result.cool.samples.forEach((s) => L.polyline([s.from, s.to], { color: heatColor(s.level), weight: 7, opacity: 0.95 }).addTo(g));
      map.current.fitBounds(L.latLngBounds(result.scored.flatMap((r) => r.coords)), { padding: [40, 40] });
    }
  }, [start, end, result, showData]);

  return <div ref={el} className="map" />;
}
