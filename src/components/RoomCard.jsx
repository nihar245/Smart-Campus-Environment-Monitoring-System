import OccupancyBar from "./OccupancyBar";
import { getAlerts } from "../utils/roomHelpers";

const ALERT_STYLE = {
  TEMP_HIGH: "danger",
  CO2_HIGH: "warning",
  OCCUPANCY_FULL: "danger",
  OCCUPANCY_WARN: "caution"
};

export default function RoomCard({ reading, roomConfig, onOpenDetail }) {
  const alerts = getAlerts(reading.alertFlags);

  return (
    <article className="room-card" onClick={() => onOpenDetail(reading.roomId)}>
      <div className="room-card-header">
        <h3>{roomConfig?.displayName || reading.roomId}</h3>
        <span className="timestamp-chip">{new Date(reading.timestamp).toLocaleTimeString()}</span>
      </div>

      <div className="room-metrics">
        <p>
          <strong>{Number(reading.temperature).toFixed(1)}°C</strong>
          <span>Temperature</span>
        </p>
        <p>
          <strong>{Number(reading.humidity).toFixed(1)}%</strong>
          <span>Humidity</span>
        </p>
        <p>
          <strong>{reading.co2} ppm</strong>
          <span>CO₂</span>
        </p>
      </div>

      <div>
        <div className="room-metrics-inline">
          <span>
            Occupancy: {reading.occupancy}
            {roomConfig?.capacity ? ` / ${roomConfig.capacity}` : ""}
          </span>
        </div>
        <OccupancyBar occupancyPct={reading.occupancyPct} />
      </div>

      <div className="alert-row">
        {alerts.length ? (
          alerts.map((alert) => (
            <span key={alert} className={`alert-badge ${ALERT_STYLE[alert] || "neutral"}`}>
              {alert}
            </span>
          ))
        ) : (
          <span className="alert-badge safe">NORMAL</span>
        )}
      </div>
    </article>
  );
}