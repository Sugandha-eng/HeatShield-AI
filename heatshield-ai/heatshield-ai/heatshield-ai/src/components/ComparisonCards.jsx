export default function ComparisonCards({ result }) {
  const { fast, cool, compare, same } = result;
  return (
    <div className="cards">
      <div className="card">
        <h3>⚡ Fastest</h3>
        <p className="big">{fast.minutes.toFixed(0)} min</p>
        <p>{(fast.distance / 1000).toFixed(2)} km · {fast.shadedPct.toFixed(0)}% shaded</p>
        <p>{fast.exposedKm.toFixed(1)} km fully exposed</p>
      </div>
      <div className="card cool">
        <h3>🌳 HeatShield{same ? ' (same route)' : ''}</h3>
        <p className="big">{cool.minutes.toFixed(0)} min</p>
        <p>
          <b>{same ? '+0' : `+${compare.extraMin.toFixed(1)}`} min</b> ·{' '}
          <b>−{compare.reductionPct.toFixed(0)}% heat</b> · <b>{compare.waterStops} water</b>
        </p>
        <p>{(cool.distance / 1000).toFixed(2)} km · {cool.shadedPct.toFixed(0)}% shaded</p>
      </div>
    </div>
  );
}
