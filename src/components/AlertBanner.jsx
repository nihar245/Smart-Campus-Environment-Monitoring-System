import { useMemo } from "react";
import { getAlerts, getAlertSeverity } from "../utils/roomHelpers";

const ALERT_LABEL = {
  TEMP_HIGH: "Temperature High",
  CO2_HIGH: "CO2 High",
  OCCUPANCY_FULL: "Capacity Full",
  OCCUPANCY_WARN: "Capacity Warning"
};

function roomSorter(a, b) {
  return a.roomId.localeCompare(b.roomId, undefined, { numeric: true, sensitivity: "base" });
}

function getSeverityLabel(severity) {
  if (severity >= 3) {
    return "● Critical";
  }
  if (severity === 2) {
    return "● High";
  }
  return "○ Warning";
}

function getSeverityClass(severity) {
  if (severity >= 3) {
    return "severity-critical";
  }
  if (severity === 2) {
    return "severity-high";
  }
  return "severity-warning";
}

export default function AlertBanner({ readings }) {
  const active = useMemo(
    () =>
      readings
        .map((reading) => ({
          roomId: reading.roomId,
          alerts: getAlerts(reading.alertFlags),
          severity: getAlertSeverity(reading.alertFlags)
        }))
        .filter((entry) => entry.alerts.length > 0)
        .sort(roomSorter),
    [readings]
  );

  if (!active.length) {
    return (
      <section className="alert-banner quiet">
        <div className="alert-headline-row">
          <h3>Live Alerts</h3>
          <span className="alert-counter safe">✓ All Clear</span>
        </div>
        <p className="alert-empty-text">All monitored spaces are within normal operating range.</p>
      </section>
    );
  }

  return (
    <section className="alert-banner">
      <div className="alert-headline-row">
        <h3>Live Alerts</h3>
        <span className="alert-counter">{active.length} Active</span>
      </div>
      <div className="alert-scroll">
        {active.map((entry) => (
          <article key={entry.roomId} className="live-alert-item">
            <div>
              <h4>{entry.roomId}</h4>
              <p className={getSeverityClass(entry.severity)}>{getSeverityLabel(entry.severity)}</p>
            </div>
            <div className="live-alert-tags">
              {entry.alerts.map((alert) => (
                <span key={alert}>{ALERT_LABEL[alert] || alert}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}