import { useEffect, useState } from "react";
import { fetchRoomHistory } from "../api/sensors";
import SensorChart from "./SensorChart";

export default function RoomDetailModal({ roomId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        setLoading(true);
        const data = await fetchRoomHistory(roomId, 30);
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
  }, [roomId]);

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>{roomId} Live Trend</h2>
          <button onClick={onClose}>Close</button>
        </header>

        {loading ? <p>Loading history...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && !error && history.length ? <SensorChart data={history} /> : null}
      </section>
    </div>
  );
}