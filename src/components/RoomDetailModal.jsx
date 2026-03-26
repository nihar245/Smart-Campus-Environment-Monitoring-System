import { useEffect, useState } from "react";
import { fetchRoomHistory } from "../api/sensors";
import SensorChart from "./SensorChart";

const MINUTES_OPTIONS = [30, 60, 120];
const METRIC_OPTIONS = [
  { key: "temperature", label: "Temperature" },
  { key: "humidity", label: "Humidity" },
  { key: "co2", label: "CO2" },
  { key: "occupancyPct", label: "Occupancy %" }
];

export default function RoomDetailModal({ roomId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [selectedMetric, setSelectedMetric] = useState("temperature");

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        setLoading(true);
        const data = await fetchRoomHistory(roomId, minutes);
        if (mounted) {
          setHistory(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load room history.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [roomId, minutes]);

  const latestPoint = history.length ? history[history.length - 1] : null;

  const selectedValues = history
    .map((row) => Number(row[selectedMetric]))
    .filter((value) => Number.isFinite(value));

  const metricSummary = selectedValues.length
    ? {
        min: Math.min(...selectedValues),
        max: Math.max(...selectedValues),
        avg: selectedValues.reduce((sum, value) => sum + value, 0) / selectedValues.length
      }
    : null;

  const metricUnit =
    selectedMetric === "temperature"
      ? "degC"
      : selectedMetric === "humidity"
        ? "%"
        : selectedMetric === "co2"
          ? "ppm"
          : "%";

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="trend-header">
          <div>
            <h2>{roomId} Live Trend</h2>
            <p className="trend-subtitle">Interactive history panel with metric focus and trend summary.</p>
          </div>
          <button onClick={onClose}>Close</button>
        </header>

        <div className="trend-toolbar">
          <div className="chip-group">
            {MINUTES_OPTIONS.map((option) => (
              <button
                key={option}
                className={`trend-chip ${minutes === option ? "active" : ""}`}
                onClick={() => setMinutes(option)}
                type="button"
              >
                {option} min
              </button>
            ))}
          </div>

          <div className="chip-group">
            {METRIC_OPTIONS.map((metric) => (
              <button
                key={metric.key}
                className={`trend-chip ${selectedMetric === metric.key ? "active" : ""}`}
                onClick={() => setSelectedMetric(metric.key)}
                type="button"
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && latestPoint ? (
          <div className="trend-stats">
            <article>
              <p>Current</p>
              <strong>
                {Number(latestPoint[selectedMetric]).toFixed(selectedMetric === "co2" ? 0 : 1)} {metricUnit}
              </strong>
            </article>
            <article>
              <p>Minimum</p>
              <strong>
                {metricSummary ? metricSummary.min.toFixed(selectedMetric === "co2" ? 0 : 1) : "--"} {metricUnit}
              </strong>
            </article>
            <article>
              <p>Maximum</p>
              <strong>
                {metricSummary ? metricSummary.max.toFixed(selectedMetric === "co2" ? 0 : 1) : "--"} {metricUnit}
              </strong>
            </article>
            <article>
              <p>Average</p>
              <strong>
                {metricSummary ? metricSummary.avg.toFixed(selectedMetric === "co2" ? 0 : 1) : "--"} {metricUnit}
              </strong>
            </article>
          </div>
        ) : null}

        {loading ? <p>Loading history...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !error && history.length ? <SensorChart data={history} metric={selectedMetric} /> : null}
      </section>
    </div>
  );
}