import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Text } from "@react-three/drei";
import {
  buildSensorPositions,
  FLOOR_COUNT,
  FLOOR_HEIGHT,
  SECTION_COUNT,
  SECTION_GAP,
  SECTION_WIDTH
} from "../data/nBlock3DLayout";
import { getSensorStatusColor } from "../utils/roomHelpers";

const ROOM_TYPE_STYLE = {
  classroom: { color: "#9cff57", depth: 2.4 },
  lab_small: { color: "#ff8c42", depth: 2.4 },
  lab_medium: { color: "#69d2ff", depth: 2.4 }
};

const TOTAL_MODEL_WIDTH = SECTION_COUNT * SECTION_WIDTH + (SECTION_COUNT - 1) * SECTION_GAP;

function getSectionRanges() {
  const start = -TOTAL_MODEL_WIDTH * 0.5;

  return Array.from({ length: SECTION_COUNT }, (_, index) => {
    const x0 = start + index * (SECTION_WIDTH + SECTION_GAP);
    const x1 = x0 + SECTION_WIDTH;
    return { x0, x1, center: (x0 + x1) * 0.5 };
  });
}

function getGapCenters() {
  const sections = getSectionRanges();
  return sections.slice(0, -1).map((section, idx) => {
    const next = sections[idx + 1];
    return (section.x1 + next.x0) * 0.5;
  });
}

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
  const buildingHeight = (FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2.2;
  const coreHeight = buildingHeight + 1.1;
  const coreY = coreHeight * 0.5;
  const bandWidth = width * 0.92;
  const wingWidth = width * 0.26;
  const wingDepth = depth * 0.88;

  return (
    <group>
      {[...Array(FLOOR_COUNT)].map((_, index) => {
        const slabY = index * FLOOR_HEIGHT;
        const slabTone = index % 2 === 0 ? "#2f4858" : "#335c67";

        return (
          <group key={`slab-${index}`}>
            <mesh position={[0, slabY, 0]}>
              <boxGeometry args={[width, 0.22, depth]} />
              <meshStandardMaterial color={slabTone} opacity={0.32} transparent depthWrite={false} />
            </mesh>
            <mesh position={[0, slabY + 0.14, 0]}>
              <boxGeometry args={[width * 0.98, 0.03, depth * 0.98]} />
              <meshBasicMaterial color="#baff4d" transparent opacity={0.22} />
            </mesh>
          </group>
        );
      })}

      {/* Wing-style facade massing inspired by the real N-block front profile */}
      <mesh position={[-width * 0.34, coreY, 0]}>
        <boxGeometry args={[wingWidth, buildingHeight, wingDepth]} />
        <meshStandardMaterial color="#4b6a58" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <mesh position={[0, coreY, 0]}>
        <boxGeometry args={[wingWidth * 1.1, buildingHeight, wingDepth]} />
        <meshStandardMaterial color="#5b4d67" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh position={[width * 0.34, coreY, 0]}>
        <boxGeometry args={[wingWidth, buildingHeight, wingDepth]} />
        <meshStandardMaterial color="#4b6a58" transparent opacity={0.14} depthWrite={false} />
      </mesh>

      {/* Vertical core towers between sections */}
      {getGapCenters().map((x, idx) => (
        <mesh key={`shell-core-${idx}`} position={[x, coreY + 0.2, 0]}>
          <boxGeometry args={[SECTION_GAP * 0.9, coreHeight, depth * 0.8]} />
          <meshStandardMaterial color="#8f6b4a" transparent opacity={0.13} depthWrite={false} />
        </mesh>
      ))}

      {/* Horizontal facade bands to give fuller height expression */}
      {[...Array(FLOOR_COUNT)].map((_, index) => (
        <mesh key={`facade-band-${index}`} position={[0, index * FLOOR_HEIGHT + 0.9, -halfDepth + 0.35]}>
          <boxGeometry args={[bandWidth, 0.18, 0.22]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.2} />
        </mesh>
      ))}

      <mesh position={[0, coreY, -halfDepth]}>
        <boxGeometry args={[width, buildingHeight, 0.2]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.08} transparent depthWrite={false} />
      </mesh>
      <mesh position={[0, coreY, halfDepth]}>
        <boxGeometry args={[width, buildingHeight, 0.2]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.08} transparent depthWrite={false} />
      </mesh>
      <mesh position={[-halfWidth, coreY, 0]}>
        <boxGeometry args={[0.2, buildingHeight, depth]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.08} transparent depthWrite={false} />
      </mesh>
      <mesh position={[halfWidth, coreY, 0]}>
        <boxGeometry args={[0.2, buildingHeight, depth]} />
        <meshStandardMaterial color="#1f2d3a" opacity={0.08} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

function ArchitecturalGuides({ depth, showDividers, showCores, hoveredCore, onHoverCore }) {
  const gapCenters = getGapCenters();
  const sectionRanges = getSectionRanges();

  return (
    <group>
      {showDividers
        ? sectionRanges.map((section, idx) => (
            <mesh key={`section-guide-${idx}`} position={[section.center, ((FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2) * 0.5, 0]}>
              <boxGeometry args={[SECTION_WIDTH, (FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2, depth * 0.98]} />
              <meshBasicMaterial color="#5ec8ff" transparent opacity={0.06} wireframe />
            </mesh>
          ))
        : null}

      {showDividers
        ? gapCenters.flatMap((x, idx) => [
            <mesh key={`divider-plane-${idx}`} position={[x, ((FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2) * 0.5, 0]}>
              <boxGeometry args={[0.22, (FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2, depth * 0.98]} />
              <meshStandardMaterial color="#c3ff5c" emissive="#8dff45" emissiveIntensity={0.25} transparent opacity={0.16} />
            </mesh>,
            <mesh key={`divider-glow-${idx}`} position={[x, ((FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2) * 0.5, 0]}>
              <boxGeometry args={[0.5, (FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2, depth * 0.2]} />
              <meshBasicMaterial color="#ff9155" transparent opacity={0.13} />
            </mesh>
          ])
        : null}

      {showCores
        ? gapCenters.map((x, idx) => {
            const coreId = idx === 0 ? "Core A: Girls WC + Stairs" : "Core B: Stairs + Boys WC";
            const active = hoveredCore === coreId;

            return (
              <group
                key={`core-${idx}`}
                position={[x, ((FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2) * 0.5, 0]}
                onPointerOver={(event) => {
                  event.stopPropagation();
                  onHoverCore(coreId);
                }}
                onPointerOut={() => onHoverCore("")}
              >
                <mesh>
                  <boxGeometry args={[SECTION_GAP * 0.82, (FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2, depth * 0.72]} />
                  <meshStandardMaterial
                    color={active ? "#8cf8ff" : "#47a8bd"}
                    emissive="#ffd24a"
                    emissiveIntensity={active ? 0.52 : 0.24}
                    transparent
                    opacity={0.3}
                  />
                </mesh>
                <mesh>
                  <boxGeometry args={[SECTION_GAP * 0.9, (FLOOR_COUNT - 1) * FLOOR_HEIGHT + 2.05, depth * 0.78]} />
                  <meshBasicMaterial color="#ffc46b" wireframe transparent opacity={0.42} />
                </mesh>
              </group>
            );
          })
        : null}
    </group>
  );
}

function RoomBoundaries({ rooms, positions, showRoomIds }) {
  return (
    <group>
      {rooms.map((room) => {
        const pos = positions[room.roomId];
        const style = ROOM_TYPE_STYLE[room.roomType] || ROOM_TYPE_STYLE.classroom;
        const boundaryWidth = Math.max(1.4, (pos?.cellWidth || 3.6) - 0.3);

        if (!pos) {
          return null;
        }

        return (
          <group key={`${room.roomId}-cell`} position={[pos.x, pos.y - 0.08, pos.z]}>
            <mesh renderOrder={20}>
              <boxGeometry args={[boundaryWidth, 0.12, style.depth]} />
              <meshStandardMaterial color={style.color} transparent opacity={0.24} depthTest={false} depthWrite={false} />
            </mesh>
            <mesh renderOrder={21}>
              <boxGeometry args={[boundaryWidth, 0.14, style.depth]} />
              <meshBasicMaterial color={style.color} wireframe transparent opacity={0.95} depthTest={false} depthWrite={false} />
            </mesh>

            {showRoomIds ? (
              <Text
                position={[0, 0.04, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={Math.max(0.35, Math.min(0.56, boundaryWidth * 0.16))}
                color="#f6f8ff"
                anchorX="center"
                anchorY="middle"
                maxWidth={boundaryWidth * 0.86}
                renderOrder={22}
              >
                {room.roomId}
              </Text>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function SensorPulse({ color, active }) {
  const ringRef = useRef(null);

  useFrame((state) => {
    if (!ringRef.current) {
      return;
    }

    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 3.6) * 0.16;
    ringRef.current.scale.set(pulse, pulse, pulse);
    ringRef.current.material.opacity = active ? 0.88 : 0.56;
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <ringGeometry args={[0.45, 0.62, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.56} />
    </mesh>
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

            <SensorPulse color={color} active={isSelected || isHovered} />

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
  const [hoveredCore, setHoveredCore] = useState("");
  const [showDividers, setShowDividers] = useState(true);
  const [showCores, setShowCores] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showRoomIds, setShowRoomIds] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

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
    const width = Math.max(TOTAL_MODEL_WIDTH + 6, Math.max(...xs) - Math.min(...xs) + 10);

    return { width, depth: 12 };
  }, [sensorPositions]);

  const cameraPosition = useMemo(
    () => [Math.max(26, buildingSize.width * 0.58), 28, Math.max(22, buildingSize.width * 0.48)],
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
          <color attach="background" args={["#07090f"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[20, 30, 16]} intensity={1.05} color="#d7ff5c" />
          <pointLight position={[0, 22, 0]} intensity={0.85} color="#d6ff62" />
          <pointLight position={[-20, 10, 12]} intensity={0.42} color="#ff7f50" />
          <pointLight position={[16, 6, -14]} intensity={0.32} color="#66d6ff" />
          <BuildingShell width={buildingSize.width} depth={buildingSize.depth} />
          <ArchitecturalGuides
            depth={buildingSize.depth}
            showDividers={showDividers}
            showCores={showCores}
            hoveredCore={hoveredCore}
            onHoverCore={setHoveredCore}
          />
          {showBoundaries ? <RoomBoundaries rooms={rooms} positions={sensorPositions} showRoomIds={showRoomIds} /> : null}
          <SensorNodes
            rooms={rooms}
            positions={sensorPositions}
            readingsByRoom={readingsByRoom}
            selectedRoomId={selectedRoomId}
            hoveredRoomId={hoveredRoomId}
            onSelectRoom={onSelectRoom}
            onHoverRoom={setHoveredRoomId}
          />
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            minDistance={15}
            maxDistance={80}
            autoRotate={autoRotate}
            autoRotateSpeed={0.7}
          />
        </Canvas>
      </div>

      <aside className="map-legend">
        <h3>N Block Sensor Map</h3>
        <p>Rotate and zoom to inspect room boundaries and sensor nodes.</p>
        <p className="sensor-count">Sensors rendered: {rooms.length}/53</p>
        <p className="sensor-count">Core status: {hoveredCore || "None selected"}</p>

        <div className="map-controls">
          <button type="button" onClick={() => setShowBoundaries((prev) => !prev)}>
            {showBoundaries ? "Hide" : "Show"} Room Boundaries
          </button>
          <button type="button" onClick={() => setShowRoomIds((prev) => !prev)}>
            {showRoomIds ? "Hide" : "Show"} Room/Lab IDs
          </button>
          <button type="button" onClick={() => setShowDividers((prev) => !prev)}>
            {showDividers ? "Hide" : "Show"} Section Dividers
          </button>
          <button type="button" onClick={() => setShowCores((prev) => !prev)}>
            {showCores ? "Hide" : "Show"} Stair/WC Cores
          </button>
          <button type="button" onClick={() => setAutoRotate((prev) => !prev)}>
            {autoRotate ? "Stop" : "Start"} Auto Rotate
          </button>
        </div>

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
          <li>
            <span className="dot core" /> Stair/Washroom Core
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