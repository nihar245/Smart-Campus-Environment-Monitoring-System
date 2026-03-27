import { useEffect, useMemo } from "react";
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
    return "Critical";
  }
  if (severity === 2) {
    return "High";
  }
  return "Warning";
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

export default function AlertsSidebar({ readings, isOpen, onToggle, onClose, onOpenDetail }) {
  const active = useMemo(
    () =>
      readings
        .map((reading) => ({
          roomId: reading.roomId,
          floor: reading.floor,
          alerts: getAlerts(reading.alertFlags),
          severity: getAlertSeverity(reading.alertFlags)
        }))
        .filter((entry) => entry.alerts.length > 0)
        .sort(roomSorter),
    [readings]
  );

  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      <button
        className={`alerts-toggle ${isOpen ? "open" : ""}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="alerts-sidebar"
        aria-label={isOpen ? "Hide building alerts" : "Show building alerts"}
      >
        ⚠ Alerts {active.length > 0 ? `(${active.length})` : ""}
      </button>

      <aside id="alerts-sidebar" className={`alerts-sidebar ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="alerts-sidebar-head">
          <h3>Building Alerts</h3>
          <button className="alerts-close" onClick={onClose} aria-label="Close alerts panel">
            ×
          </button>
        </div>

        <p className="alerts-sidebar-subtitle">All active alerts across the building, shown vertically.</p>

        <div className="alerts-sidebar-list">
          {active.length ? (
            active.map((entry) => (
              <button key={entry.roomId} className="alerts-sidebar-item" onClick={() => onOpenDetail(entry.roomId)}>
                <div className="alerts-sidebar-item-head">
                  <h4>{entry.roomId}</h4>
                  <span>Floor {entry.floor}</span>
                </div>
                <p className={getSeverityClass(entry.severity)}>
                  {getSeverityLabel(entry.severity)}
                </p>
                <div className="alerts-sidebar-tags">
                  {entry.alerts.map((alert) => (
                    <span key={alert}>{ALERT_LABEL[alert] || alert}</span>
                  ))}
                </div>
              </button>
            ))
          ) : (
            <p className="alerts-sidebar-empty">All spaces are currently within normal range.</p>
          )}
        </div>
      </aside>

      {isOpen ? <button className="alerts-sidebar-backdrop" onClick={onClose} aria-label="Close alerts panel" /> : null}
    </>
  );
}
