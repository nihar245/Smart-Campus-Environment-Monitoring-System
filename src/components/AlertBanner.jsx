import { getAlerts } from "../utils/roomHelpers";

export default function AlertBanner({ readings }) {
  const active = readings
    .map((reading) => ({ roomId: reading.roomId, alerts: getAlerts(reading.alertFlags) }))
    .filter((entry) => entry.alerts.length > 0);

  if (!active.length) {
    return (
      <section className="alert-banner quiet">
        <p>All monitored spaces are within normal operating range.</p>
      </section>
    );
  }

  return (
    <section className="alert-banner">
      <strong>Live alerts</strong>
      <div className="alert-scroll">
        {active.map((entry) => (
          <p key={entry.roomId}>
            {entry.roomId}: {entry.alerts.join(", ")}
          </p>
        ))}
      </div>
    </section>
  );
}