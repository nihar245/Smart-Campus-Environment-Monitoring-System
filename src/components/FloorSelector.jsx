export default function FloorSelector({ selectedFloor, onSelectFloor }) {
  return (
    <div className="floor-selector">
      {[1, 2, 3, 4, 5].map((floor) => (
        <button
          key={floor}
          className={`floor-pill ${selectedFloor === floor ? "active" : ""}`}
          onClick={() => onSelectFloor(floor)}
        >
          Floor {floor}
        </button>
      ))}
    </div>
  );
}