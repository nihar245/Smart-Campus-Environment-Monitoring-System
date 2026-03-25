import { getFloorSummary } from "../utils/roomHelpers";

export default function FloorSummary({ floorReadings, rooms }) {
  const summary = getFloorSummary(floorReadings, rooms);
  const occupancyPct = summary.capacity ? (summary.totalOccupancy / summary.capacity) * 100 : 0;

  return (
    <section className="floor-summary">
      <article>
        <p>Avg Temperature</p>
        <strong>{summary.avgTemp.toFixed(1)}°C</strong>
      </article>
      <article>
        <p>Avg Humidity</p>
        <strong>{summary.avgHumidity.toFixed(0)}%</strong>
      </article>
      <article>
        <p>Avg CO₂</p>
        <strong>{summary.avgCo2.toFixed(0)} ppm</strong>
      </article>
      <article>
        <p>Occupancy</p>
        <strong>
          {summary.totalOccupancy}/{summary.capacity} ({occupancyPct.toFixed(0)}%)
        </strong>
      </article>
    </section>
  );
}