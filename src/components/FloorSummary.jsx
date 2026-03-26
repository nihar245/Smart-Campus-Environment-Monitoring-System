import { getFloorSummary } from "../utils/roomHelpers";

const STATS = [
  { key: "avgTemp",      label: "Avg Temp",    icon: "🌡", format: (v) => `${v.toFixed(1)}°C` },
  { key: "avgHumidity", label: "Humidity",    icon: "💧", format: (v) => `${v.toFixed(0)}%` },
  { key: "avgCo2",      label: "Avg CO₂",     icon: "🌿", format: (v) => `${v.toFixed(0)} ppm` },
];

export default function FloorSummary({ floorReadings, rooms }) {
  const summary = getFloorSummary(floorReadings, rooms);
  const occupancyPct = summary.capacity ? (summary.totalOccupancy / summary.capacity) * 100 : 0;

  return (
    <section className="floor-summary">
      {STATS.map(({ key, label, icon, format }) => (
        <article key={key}>
          <p>{icon} {label}</p>
          <strong>{format(summary[key])}</strong>
        </article>
      ))}
      <article>
        <p>👥 Occupancy</p>
        <strong>
          {summary.totalOccupancy}/{summary.capacity}
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '6px' }}>
            ({occupancyPct.toFixed(0)}%)
          </span>
        </strong>
      </article>
    </section>
  );
}