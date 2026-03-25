import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchLatestReadings } from "../api/sensors";
import { groupByFloor } from "../utils/roomHelpers";

export function useLiveReadings(intervalMs = 30000) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLiveReadings = useCallback(async () => {
    try {
      const latest = await fetchLatestReadings();
      setReadings(latest);
      setLastUpdated(new Date().toISOString());
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch live readings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveReadings();
    const timer = setInterval(fetchLiveReadings, intervalMs);
    return () => clearInterval(timer);
  }, [fetchLiveReadings, intervalMs]);

  const readingsByFloor = useMemo(() => groupByFloor(readings), [readings]);

  return {
    readings,
    readingsByFloor,
    loading,
    error,
    lastUpdated,
    refresh: fetchLiveReadings
  };
}