const FLOOR_ROOM_SEQUENCE = {
  1: ["N-101", "N-102", "N-103", "N-104", "N-105", "N-106"],
  2: ["N-201", "N-202", "N-203", "N-204", "N-205", "N-206", "N-207", "N-208", "N-209"],
  3: ["N-301", "N-302", "N-303", "N-304", "N-305", "N-306", "N-307", "N-308", "N-309"],
  4: [
    "N-401",
    "N-402",
    "N-403",
    "N-404",
    "N-405",
    "N-406",
    "N-407A",
    "N-407B",
    "N-408A",
    "N-408B",
    "N-409A",
    "N-409B"
  ],
  5: [
    "N-502",
    "N-503",
    "N-504",
    "N-505",
    "N-507",
    "N-508",
    "N-509",
    "N-510",
    "N-501",
    "N-5011",
    "N-506-5061",
    "N-506-5062",
    "N-506-5063",
    "N-506-5064",
    "N-506-5065",
    "N-506-5066",
    "N-506-5067"
  ]
};

function getOrderedFloorRooms(floor, floorRooms) {
  const sequence = FLOOR_ROOM_SEQUENCE[floor] || [];
  const byId = floorRooms.reduce((acc, room) => {
    acc[room.roomId] = room;
    return acc;
  }, {});

  const ordered = sequence.map((roomId) => byId[roomId]).filter(Boolean);
  const remaining = floorRooms
    .filter((room) => !sequence.includes(room.roomId))
    .sort((a, b) => a.roomId.localeCompare(b.roomId, undefined, { numeric: true, sensitivity: "base" }));

  return [...ordered, ...remaining];
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

  Object.entries(floors).forEach(([floorNumber, floorRooms]) => {
    const floor = Number(floorNumber);
    const sorted = getOrderedFloorRooms(floor, floorRooms);

    // Serpentine floor direction: even floors run right-to-left.
    const ordered = floor % 2 === 0 ? sorted.reverse() : sorted;
    const spacingX = 3.6;

    ordered.forEach((room, index) => {
      const offsetX = (ordered.length - 1) * spacingX * 0.5;

      positions[room.roomId] = {
        x: index * spacingX - offsetX,
        y: floor * 4 - 2,
        z: 0
      };
    });
  });

  return positions;
}