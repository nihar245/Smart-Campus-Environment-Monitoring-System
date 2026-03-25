const ALERT_PRIORITY = {
  TEMP_HIGH: 3,
  OCCUPANCY_FULL: 3,
  CO2_HIGH: 2,
  OCCUPANCY_WARN: 1
};

export function groupByFloor(readings) {
  return readings.reduce((acc, reading) => {
    const floor = reading.floor;
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(reading);
    return acc;
  }, {});
}

export function getAlerts(alertFlags = "") {
  return alertFlags
    .split(",")
    .map((alert) => alert.trim())
    .filter(Boolean);
}

export function getAlertSeverity(alertFlags = "") {
  const alerts = getAlerts(alertFlags);
  return alerts.reduce((highest, current) => {
    const score = ALERT_PRIORITY[current] || 0;
    return score > highest ? score : highest;
  }, 0);
}

export function formatTimestamp(value) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString();
}

export function mergeRoomConfig(readings, rooms) {
  const roomMap = rooms.reduce((acc, room) => {
    acc[room.roomId] = room;
    return acc;
  }, {});

  return readings.map((reading) => ({
    ...reading,
    roomConfig: roomMap[reading.roomId] || null
  }));
}

export function getFloorSummary(readings, rooms) {
  if (!readings.length) {
    return {
      avgTemp: 0,
      avgHumidity: 0,
      avgCo2: 0,
      totalOccupancy: 0,
      capacity: 0
    };
  }

  const roomCapMap = rooms.reduce((acc, room) => {
    acc[room.roomId] = room.capacity || 0;
    return acc;
  }, {});

  const totals = readings.reduce(
    (acc, reading) => {
      acc.temp += reading.temperature || 0;
      acc.humidity += reading.humidity || 0;
      acc.co2 += reading.co2 || 0;
      acc.occupancy += reading.occupancy || 0;
      acc.capacity += roomCapMap[reading.roomId] || 0;
      return acc;
    },
    { temp: 0, humidity: 0, co2: 0, occupancy: 0, capacity: 0 }
  );

  return {
    avgTemp: totals.temp / readings.length,
    avgHumidity: totals.humidity / readings.length,
    avgCo2: totals.co2 / readings.length,
    totalOccupancy: totals.occupancy,
    capacity: totals.capacity
  };
}

export function getSensorStatusColor(reading) {
  const severity = getAlertSeverity(reading?.alertFlags || "");
  if (severity >= 3) {
    return "#ff5050";
  }
  if (severity === 2) {
    return "#ff9f43";
  }
  if (severity === 1) {
    return "#f4d35e";
  }
  return "#2ec4b6";
}