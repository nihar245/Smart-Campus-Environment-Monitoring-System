import RoomCard from "./RoomCard";

function sortByRoomId(a, b) {
  return a.roomId.localeCompare(b.roomId, undefined, { numeric: true, sensitivity: "base" });
}

function N506Group({ rooms, roomMap, onOpenDetail }) {
  const combinedOccupancy = rooms.reduce((sum, room) => sum + (room.occupancy || 0), 0);
  const combinedCapacity = 140;

  return (
    <section className="n506-group">
      <header>
        <h3>N-506 (Big Lab)</h3>
        <p>
          Combined occupancy: {combinedOccupancy}/{combinedCapacity}
        </p>
      </header>
      <div className="room-grid nested">
        {rooms.map((reading) => (
          <RoomCard
            key={reading.roomId}
            reading={reading}
            roomConfig={roomMap[reading.roomId]}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </section>
  );
}

export default function RoomGrid({ readings, rooms, floor, onOpenDetail }) {
  const roomMap = rooms.reduce((acc, room) => {
    acc[room.roomId] = room;
    return acc;
  }, {});

  const n506Rooms = readings
    .filter((r) => roomMap[r.roomId]?.parentRoom === "N-506")
    .sort(sortByRoomId);
  const regularRooms = readings
    .filter((r) => roomMap[r.roomId]?.parentRoom !== "N-506")
    .sort(sortByRoomId);

  return (
    <div className="room-grid-wrapper">
      <div className="room-grid">
        {regularRooms.map((reading) => (
          <RoomCard
            key={reading.roomId}
            reading={reading}
            roomConfig={roomMap[reading.roomId]}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>

      {floor === 5 && n506Rooms.length > 0 ? (
        <N506Group rooms={n506Rooms} roomMap={roomMap} onOpenDetail={onOpenDetail} />
      ) : null}
    </div>
  );
}