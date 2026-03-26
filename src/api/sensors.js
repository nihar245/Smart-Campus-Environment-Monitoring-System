const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
  "";

function toNumber(value, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeReading(reading = {}) {
  const occupancy = toNumber(reading.occupancy, 0);
  const capacity = toNumber(reading.capacity, 0);
  const occupancyPctValue = toNumber(reading.occupancyPct, Number.NaN);

  return {
    ...reading,
    floor: toNumber(reading.floor, 0),
    temperature: toNumber(reading.temperature, 0),
    humidity: toNumber(reading.humidity, 0),
    co2: toNumber(reading.co2, 0),
    occupancy,
    capacity,
    occupancyPct: Number.isFinite(occupancyPctValue)
      ? occupancyPctValue
      : capacity > 0
        ? (occupancy / capacity) * 100
        : 0,
    alertFlags: typeof reading.alertFlags === "string" ? reading.alertFlags : ""
  };
}

function normalizeReadingsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.map(normalizeReading);
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items.map(normalizeReading);
  }

  return [];
}

function normalizeRoom(room = {}) {
  return {
    ...room,
    floor: toNumber(room.floor, 0),
    capacity: toNumber(room.capacity, 0)
  };
}

function normalizeRoomsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.map(normalizeRoom);
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items.map(normalizeRoom);
  }

  return [];
}

function ensureBaseUrl() {
  if (!BASE_URL) {
    throw new Error(
      "Missing API base URL. Set VITE_API_URL (or REACT_APP_API_URL for compatibility) in your environment file."
    );
  }
}

async function request(path) {
  ensureBaseUrl();
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchLatestReadings() {
  const data = await request("/readings/latest");
  return normalizeReadingsPayload(data);
}

export async function fetchRooms() {
  const data = await request("/rooms");
  return normalizeRoomsPayload(data);
}

export async function fetchRoomHistory(roomId, minutes = 30) {
  const data = await request(`/readings/room/${encodeURIComponent(roomId)}?minutes=${minutes}`);
  return normalizeReadingsPayload(data);
}