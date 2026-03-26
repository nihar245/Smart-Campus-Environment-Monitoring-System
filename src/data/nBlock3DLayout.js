export const SECTION_WIDTH = 12;
export const SECTION_GAP = 4;
export const SECTION_COUNT = 3;
export const FLOOR_COUNT = 5;
export const FLOOR_HEIGHT = 3.6;
export const SENSOR_OFFSET_Y = 0.56;

const FLOOR_SECTION_LAYOUT = {
  1: [
    ["N-101", "N-102", "N-103"],
    ["N-104", "N-105", "N-106"],
    []
  ],
  2: [
    ["N-201", "N-202", "N-203"],
    ["N-204", "N-205", "N-206"],
    ["N-207", "N-208", "N-209"]
  ],
  3: [
    ["N-301", "N-302", "N-303"],
    ["N-304", "N-305", "N-306"],
    ["N-307", "N-308", "N-309"]
  ],
  4: [
    ["N-401", "N-402", "N-403"],
    ["N-404", "N-405", "N-406"],
    ["N-407A", "N-407B", "N-408A", "N-408B", "N-409A", "N-409B"]
  ],
  5: [
    ["N-501", "N-502", "N-503", "N-504", "N-505"],
    ["N-506-5061", "N-506-5062", "N-506-5063", "N-506-5064", "N-506-5065", "N-506-5066", "N-506-5067"],
    ["N-507", "N-508", "N-509", "N-510", "N-5011"]
  ]
};

const ROOM_WIDTH_WEIGHT = {
  "N-501": 2,
  "N-5011": 2
};

function buildFloorRoomGeometry(floor, floorRooms) {
  const byId = floorRooms.reduce((acc, room) => {
    acc[room.roomId] = room;
    return acc;
  }, {});

  const floorLayout = FLOOR_SECTION_LAYOUT[floor] || [];
  const geometry = {};

  floorLayout.forEach((sectionRooms, sectionIndex) => {
    const sectionStart = sectionIndex * (SECTION_WIDTH + SECTION_GAP);
    const sectionWeights = sectionRooms.map((roomId) => ROOM_WIDTH_WEIGHT[roomId] || 1);
    const totalWeight = sectionWeights.reduce((sum, weight) => sum + weight, 0) || 3;
    const unitWidth = SECTION_WIDTH / totalWeight;
    let cursorX = sectionStart;

    sectionRooms.forEach((roomId, cellIndex) => {
      const room = byId[roomId];
      if (!room) {
        return;
      }

      const roomWeight = sectionWeights[cellIndex] || 1;
      const roomWidth = unitWidth * roomWeight;

      geometry[roomId] = {
        x: cursorX + roomWidth * 0.5,
        cellWidth: roomWidth
      };

      cursorX += roomWidth;
    });
  });

  const mappedIds = new Set(Object.keys(geometry));
  const remainingRooms = floorRooms
    .filter((room) => !mappedIds.has(room.roomId))
    .sort((a, b) => a.roomId.localeCompare(b.roomId, undefined, { numeric: true, sensitivity: "base" }));

  if (remainingRooms.length > 0) {
    const usedWidth = floorLayout.length * SECTION_WIDTH + Math.max(0, floorLayout.length - 1) * SECTION_GAP;
    const extraCellWidth = 3.2;

    remainingRooms.forEach((room, index) => {
      geometry[room.roomId] = {
        x: usedWidth + (index + 0.5) * extraCellWidth,
        cellWidth: extraCellWidth
      };
    });
  }

  return geometry;
}

export function buildSensorPositions(rooms) {
  const floors = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {});

  const positions = {};
  const floorGeometry = {};
  const xPoints = [];

  Object.entries(floors).forEach(([floorNumber, floorRooms]) => {
    const floor = Number(floorNumber);
    floorGeometry[floor] = buildFloorRoomGeometry(floor, floorRooms);

    floorRooms.forEach((room) => {
      const geometry = floorGeometry[floor][room.roomId];
      if (!geometry) {
        return;
      }

      xPoints.push(geometry.x);
      positions[room.roomId] = {
        x: geometry.x,
        y: (floor - 1) * FLOOR_HEIGHT + SENSOR_OFFSET_Y,
        z: 0,
        cellWidth: geometry.cellWidth
      };
    });
  });

  // Center all floors around x=0 so the whole building stays symmetric in the camera.
  if (xPoints.length > 0) {
    const minX = Math.min(...xPoints);
    const maxX = Math.max(...xPoints);
    const centerX = (minX + maxX) * 0.5;

    Object.keys(positions).forEach((roomId) => {
      positions[roomId].x -= centerX;
    });
  }

  return positions;
}