// Central config: personas, demo presets, constants.
export const MAP_CENTER = [30.901, 75.8573]; // Ludhiana. Change to your demo city/campus.

export const PERSONAS = {
  pedestrian: { label: 'Pedestrian',      speed: 1.35, heatSensitivity: 1.0, waterWeight: 1.0 },
  elderly:    { label: 'Elderly',         speed: 1.0,  heatSensitivity: 1.4, waterWeight: 1.5 },
  worker:     { label: 'Delivery worker', speed: 1.6,  heatSensitivity: 1.2, waterWeight: 1.3 },
};

// APPROXIMATE coordinates. Open the app, click the real places on the map,
// and replace these with spots where the cool route clearly differs.
export const PRESETS = [
  { name: 'Clock Tower → Rose Garden', start: [30.9057, 75.8573], end: [30.9005, 75.8330] },
  { name: 'Railway Stn → Clock Tower', start: [30.9030, 75.8440], end: [30.9057, 75.8573] },
  { name: 'Bus Stand → Clock Tower',   start: [30.8985, 75.8645], end: [30.9057, 75.8573] },
];

export const SAMPLE_STEP_M = 50;     // sampling distance along route
export const TREE_RADIUS_M = 30;     // tree counts as shade within this distance
export const WATER_RADIUS_M = 150;   // water point counts if this close to route
export const MAX_EXTRA_TIME = 1.5;   // HeatShield route may be at most 1.5x slower
export const MAX_ROUTE_KM = 8;
