import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ChartPanel({ result }) {
  const { fast, cool } = result;
  const base = fast.score || 1;
  const data = [
    { name: 'Heat (fastest=100)', Fastest: 100, HeatShield: +((cool.score / base) * 100).toFixed(0) },
    { name: 'Shaded %', Fastest: +fast.shadedPct.toFixed(0), HeatShield: +cool.shadedPct.toFixed(0) },
    { name: 'Time (min)', Fastest: +fast.minutes.toFixed(0), HeatShield: +cool.minutes.toFixed(0) },
  ];
  return (
    <div style={{ height: 190 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Fastest" fill="#9ca3af" />
          <Bar dataKey="HeatShield" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
