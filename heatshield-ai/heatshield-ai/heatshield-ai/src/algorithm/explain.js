// Template-based explanation (swap for an LLM call if time allows).
export function explain({ fast, cool, same, compare }, weather, persona) {
  const cond = `At ${weather.feelsLike.toFixed(0)}°C feels-like (UV ${weather.uv.toFixed(0)})`;
  if (same) {
    return `${cond}, the fastest route is already the coolest option we found for a ${persona.label.toLowerCase()}. No better shaded alternative exists on this trip.`;
  }
  const avoided = Math.max(0, fast.exposedKm - cool.exposedKm);
  return (
    `${cond}, HeatShield picks a route that costs ${compare.extraMin.toFixed(1)} extra min ` +
    `but cuts heat exposure by ${compare.reductionPct.toFixed(0)}%. ` +
    `It avoids ${avoided.toFixed(1)} km of unshaded road, is ${cool.shadedPct.toFixed(0)}% shaded, ` +
    `and passes ${cool.waterStops} water point${cool.waterStops === 1 ? '' : 's'}.`
  );
}
