import { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { fetchRooms } from "./api/sensors";
import AlertBanner from "./components/AlertBanner";
import AlertsSidebar from "./components/AlertsSidebar";
import FloorSelector from "./components/FloorSelector";
import FloorSummary from "./components/FloorSummary";
import RoomDetailModal from "./components/RoomDetailModal";
import RoomGrid from "./components/RoomGrid";
import ThreeDMap from "./components/ThreeDMap";
import { DEFAULT_ROOMS } from "./constants/rooms";
import { useLiveReadings } from "./hooks/useLiveReadings";
import { formatTimestamp } from "./utils/roomHelpers";

function DashboardView({ selectedFloor, onSelectFloor, floorReadings, rooms, onOpenDetail }) {
  return (
    <>
      <FloorSelector selectedFloor={selectedFloor} onSelectFloor={onSelectFloor} />
      <FloorSummary floorReadings={floorReadings} rooms={rooms} />
      <AlertBanner readings={floorReadings} />
      <RoomGrid floor={selectedFloor} readings={floorReadings} rooms={rooms} onOpenDetail={onOpenDetail} />
    </>
  );
}

function ThreeDView({ rooms, readings, selectedRoomId, onSelectRoom }) {
  return <ThreeDMap rooms={rooms} readings={readings} selectedRoomId={selectedRoomId} onSelectRoom={onSelectRoom} />;
}

export default function App() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isAlertsSidebarOpen, setIsAlertsSidebarOpen] = useState(false);
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [roomsError, setRoomsError] = useState("");

  const { readings, readingsByFloor, loading, error, lastUpdated, refresh } = useLiveReadings(300000);

  useEffect(() => {
    let mounted = true;

    async function loadRooms() {
      try {
        const roomConfig = await fetchRooms();
        if (mounted && Array.isArray(roomConfig) && roomConfig.length > 0) {
          setRooms(roomConfig);
          setRoomsError("");
        }
      } catch (err) {
        if (mounted) {
          setRoomsError(err.message || "Unable to load rooms config. Using fallback layout.");
        }
      }
    }

    loadRooms();

    return () => {
      mounted = false;
    };
  }, []);

  const floorReadings = readingsByFloor[selectedFloor] || [];

  const activeRoom = useMemo(() => {
    if (!selectedRoomId) {
      return "";
    }
    const match = readings.find((r) => r.roomId === selectedRoomId);
    return match ? match.roomId : selectedRoomId;
  }, [readings, selectedRoomId]);

  return (
    <main className="app-shell">
      <AlertsSidebar
        readings={readings}
        isOpen={isAlertsSidebarOpen}
        onToggle={() => setIsAlertsSidebarOpen((open) => !open)}
        onClose={() => setIsAlertsSidebarOpen(false)}
        onOpenDetail={setSelectedRoomId}
      />

      <header className="hero">
        <div>
          <p className="eyebrow">Smart Campus Monitoring</p>
          <h1>N Block Environmental Dashboard</h1>
          <p className="hero-text">
            Live telemetry across all 53 monitored spaces — historical trends and an interactive 3D sensor map.
          </p>
        </div>

        <div className="status-box">
          <p>⏱ Last updated</p>
          <strong>{formatTimestamp(lastUpdated)}</strong>
          <button onClick={refresh}>↻ Refresh now</button>
        </div>
      </header>

      {error ? <p className="error-text">Live feed error: {error}</p> : null}
      {roomsError ? <p className="error-text">Room config warning: {roomsError}</p> : null}

      <nav className="top-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>⬡ Dashboard</NavLink>
        <NavLink to="/map-3d" className={({ isActive }) => (isActive ? "active" : "")}>◈ 3D Sensor Map</NavLink>
      </nav>

      {loading ? <p className="loading">Loading latest readings...</p> : null}

      <Routes>
        <Route
          path="/"
          element={
            <DashboardView
              selectedFloor={selectedFloor}
              onSelectFloor={setSelectedFloor}
              floorReadings={floorReadings}
              rooms={rooms}
              onOpenDetail={setSelectedRoomId}
            />
          }
        />
        <Route
          path="/map-3d"
          element={<ThreeDView rooms={rooms} readings={readings} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />}
        />
      </Routes>

      {activeRoom ? <RoomDetailModal roomId={activeRoom} onClose={() => setSelectedRoomId("")} /> : null}
    </main>
  );
}