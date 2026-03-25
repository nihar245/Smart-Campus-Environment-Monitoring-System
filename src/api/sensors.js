const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
  "";

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
  return request("/readings/latest");
}

export async function fetchRooms() {
  return request("/rooms");
}

export async function fetchRoomHistory(roomId, minutes = 30) {
  return request(`/readings/room/${encodeURIComponent(roomId)}?minutes=${minutes}`);
}