export default function OccupancyBar({ occupancyPct }) {
  const safeValue = Math.max(0, Math.min(occupancyPct || 0, 120));
  const barClass = safeValue >= 100 ? "full" : safeValue >= 80 ? "warn" : "normal";

  return (
    <div className="occupancy-wrapper">
      <div className="occupancy-track">
        <div className={`occupancy-fill ${barClass}`} style={{ width: `${Math.min(safeValue, 100)}%` }} />
      </div>
      <span className="occupancy-label">{Math.round(occupancyPct || 0)}%</span>
    </div>
  );
}