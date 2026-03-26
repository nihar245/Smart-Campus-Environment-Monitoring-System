import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { buildSensorPositions } from "../data/nBlock3DLayout";
import { getSensorStatusColor } from "../utils/roomHelpers";

const ROOM_TYPE_STYLE = {
  classroom: { color: "#4ea8de", width: 3.6, depth: 2.4 },
  lab_small: { color: "#80ed99", width: 3.2, depth: 2.2 },
  lab_medium: { color: "#ffd166", width: 3.8, depth: 2.4 }
};

function getRoomTypeLabel(roomType) {
  if (roomType === "classroom") {
    return "Classroom";
  }
  if (roomType === "lab_medium") {
    return "Medium Lab";
  }
  return "Small Lab";
}

function BuildingShell({ width, depth }) {
  const halfWidth = width * 0.5;
  const halfDepth = depth * 0.5;

  return (
    <group>
      {[1, 2, 3, 4, 5].map((floor) => (
        <mesh key={floor} position={[0, floor * 4 - 4, 0]}>
          <boxGeometry args={[width, 0.22, depth]} />
          <meshStandardMaterial color={floor % 2 === 0 ? "#2f4858" : "#335c67"} opacity={0.9} transparent />
        </mesh>
      ))}
      <mesh position={[0, 8, -halfDepth]}>
        <boxGeometry args={[width, 20, 0.2]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.35} transparent />
      </mesh>
      <mesh position={[0, 8, halfDepth]}>
        <boxGeometry args={[width, 20, 0.2]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.35} transparent />
      </mesh>
      <mesh position={[-halfWidth, 8, 0]}>
        <boxGeometry args={[0.2, 20, depth]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.35} transparent />
      </mesh>
      <mesh position={[halfWidth, 8, 0]}>
        <boxGeometry args={[0.2, 20, depth]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.35} transparent />
      </mesh>
    </group>
  );
}

function RoomBoundaries({ rooms, positions }) {
  return (
    <group>
      {rooms.map((room) => {
        const pos = positions[room.roomId];
        const style = ROOM_TYPE_STYLE[room.roomType] || ROOM_TYPE_STYLE.classroom;

        if (!pos) {
          return null;
        }

        return (
          <group key={`${room.roomId}-cell`} position={[pos.x, pos.y - 0.08, pos.z]}>
            <mesh>
              <boxGeometry args={[style.width, 0.12, style.depth]} />
              <meshStandardMaterial color={style.color} transparent opacity={0.22} />
            </mesh>
            <mesh>
              <boxGeometry args={[style.width, 0.14, style.depth]} />
              <meshBasicMaterial color={style.color} wireframe transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function SensorNodes({
  rooms,
  positions,
  readingsByRoom,
  selectedRoomId,
  hoveredRoomId,
  onSelectRoom,
  onHoverRoom
}) {

  return (
    <group>
      {rooms.map((room) => {
        const reading = readingsByRoom[room.roomId];
        const pos = positions[room.roomId];
        const color = getSensorStatusColor(reading);
        const isSelected = selectedRoomId === room.roomId;
        const isHovered = hoveredRoomId === room.roomId;

        if (!pos) {
          return null;
        }

        return (
          <group key={room.roomId} position={[pos.x, pos.y, pos.z]}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                onSelectRoom(room.roomId);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                onHoverRoom(room.roomId);
              }}
              onPointerOut={() => onHoverRoom("")}
            >
              <sphereGeometry args={[isSelected ? 0.46 : isHovered ? 0.42 : 0.35, 24, 24]} />
              <meshStandardMaterial emissive={color} emissiveIntensity={0.7} color={color} />
            </mesh>

            {isHovered ? (
              <Html position={[0, 0.9, 0]} center distanceFactor={12} className="map-tooltip-wrap">
                <div className="map-tooltip">
                  <strong>{room.roomId}</strong>
                  <p>Floor {room.floor}</p>
                  <p>{room.displayName || getRoomTypeLabel(room.roomType)}</p>
                </div>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

export default function ThreeDMap({ rooms, readings, selectedRoomId, onSelectRoom }) {
  const [hoveredRoomId, setHoveredRoomId] = useState("");

  const readingsByRoom = useMemo(() => {
    return readings.reduce((acc, item) => {
      acc[item.roomId] = item;
      return acc;
    }, {});
  }, [readings]);

  const sensorPositions = useMemo(() => buildSensorPositions(rooms), [rooms]);
  const buildingSize = useMemo(() => {
    const points = Object.values(sensorPositions);
    if (!points.length) {
      return { width: 24, depth: 18 };
    }

    const xs = points.map((point) => point.x);
    const width = Math.max(24, Math.max(...xs) - Math.min(...xs) + 10);

    return { width, depth: 12 };
  }, [sensorPositions]);

  const cameraPosition = useMemo(
    () => [Math.max(26, buildingSize.width * 0.58), 24, Math.max(22, buildingSize.width * 0.48)],
    [buildingSize.width]
  );

  const roomsById = useMemo(
    () =>
      rooms.reduce((acc, room) => {
        acc[room.roomId] = room;
        return acc;
      }, {}),
    [rooms]
  );

  const infoRoomId = hoveredRoomId || selectedRoomId;
  const infoRoom = infoRoomId ? roomsById[infoRoomId] : null;

  return (
    <section className="map-panel">
      <div className="map-canvas-wrap">
        <Canvas camera={{ position: cameraPosition, fov: 45 }}>
          <color attach="background" args={["#0b132b"]} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[20, 30, 16]} intensity={1.2} />
          <BuildingShell width={buildingSize.width} depth={buildingSize.depth} />
          <RoomBoundaries rooms={rooms} positions={sensorPositions} />
          <SensorNodes
            rooms={rooms}
            positions={sensorPositions}
            readingsByRoom={readingsByRoom}
            selectedRoomId={selectedRoomId}
            hoveredRoomId={hoveredRoomId}
            onSelectRoom={onSelectRoom}
            onHoverRoom={setHoveredRoomId}
          />
          <OrbitControls makeDefault enablePan enableZoom minDistance={15} maxDistance={80} />
        </Canvas>
      </div>

      <aside className="map-legend">
        <h3>N Block Sensor Map</h3>
        <p>Rotate and zoom to inspect room boundaries and sensor nodes.</p>
        <p className="sensor-count">Sensors rendered: {rooms.length}/53</p>
        <ul>
          <li>
            <span className="dot normal" /> Normal
          </li>
          <li>
            <span className="dot warning" /> Warning
          </li>
          <li>
            <span className="dot danger" /> Critical
          </li>
        </ul>

        <p className="boundary-title">Room boundary color</p>
        <ul>
          <li>
            <span className="dot classroom" /> Classroom
          </li>
          <li>
            <span className="dot lab-small" /> Small Lab
          </li>
          <li>
            <span className="dot lab-medium" /> Medium Lab
          </li>
        </ul>

        {infoRoomId ? (
          <div className="selected-node">
            <strong>{infoRoomId}</strong>
            {infoRoom ? (
              <p>
                Floor {infoRoom.floor} · {infoRoom.displayName || getRoomTypeLabel(infoRoom.roomType)}
              </p>
            ) : null}
            {readingsByRoom[infoRoomId] ? (
              <p>
                Temp {Number(readingsByRoom[infoRoomId].temperature).toFixed(1)}°C, CO₂ {Number(readingsByRoom[infoRoomId].co2)} ppm
              </p>
            ) : (
              <p>No live reading currently available.</p>
            )}
          </div>
        ) : (
          <p>Hover a sensor to see room and floor info. Click to pin details.</p>
        )}
      </aside>
    </section>
  );
}