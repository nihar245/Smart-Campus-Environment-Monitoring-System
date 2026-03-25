# Smart Campus Environment Monitoring System
## Frontend Developer Context

---

## Project overview

A cloud-native serverless dashboard that displays real-time environmental sensor data (temperature, humidity, CO₂, occupancy) for a 5-floor university building. There is no physical hardware — all sensor data is simulated by an AWS Lambda function running on a 30-second schedule and stored in DynamoDB. The React frontend polls the backend via API Gateway to display live readings.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (your responsibility) |
| Hosting | AWS S3 static website hosting |
| API | AWS API Gateway (REST) |
| Backend | AWS Lambda (Node.js / Python) |
| Database | AWS DynamoDB |
| Alerts | AWS SNS (email) |
| Scheduling | AWS EventBridge Scheduler |

---

## Building layout — all 53 monitored rooms

### Floor 1 — 6 classrooms
`N-101` `N-102` `N-103` `N-104` `N-105` `N-106`

### Floor 2 — 9 classrooms
`N-201` `N-202` `N-203` `N-204` `N-205` `N-206` `N-207` `N-208` `N-209`

### Floor 3 — 9 classrooms
`N-301` `N-302` `N-303` `N-304` `N-305` `N-306` `N-307` `N-308` `N-309`

### Floor 4 — 6 classrooms + 6 labs
Classrooms: `N-401` `N-402` `N-403` `N-404` `N-405` `N-406`
Labs (separate rooms): `N-407A` `N-407B` `N-408A` `N-408B` `N-409A` `N-409B`

### Floor 5 — small labs + medium labs + big lab
Small labs: `N-502` `N-503` `N-504` `N-505` `N-507` `N-508` `N-509` `N-510`
Medium labs (capacity 40 each): `N-501` `N-5011`
N-506 big lab subdivisions (7 small rooms): `N-506-5061` `N-506-5062` `N-506-5063` `N-506-5064` `N-506-5065` `N-506-5066` `N-506-5067`

### Room type capacities
| Type | Capacity |
|---|---|
| Classroom | 80 students |
| Small lab | 20 students |
| Medium lab | 40 students |

---

## API reference

Base URL will be provided once API Gateway is deployed. Store it in `.env`:

```
REACT_APP_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com/prod
```

### `GET /readings/latest`
Returns the most recent sensor reading for every room (53 items). Use this to populate the main dashboard view. Poll this every 30 seconds.

**Response:**
```json
[
  {
    "roomId": "N-506-5063",
    "timestamp": "2025-03-25T14:32:00Z",
    "temperature": 27.4,
    "humidity": 62,
    "co2": 850,
    "occupancy": 17,
    "occupancyPct": 85,
    "floor": 5,
    "alertFlags": ""
  }
]
```

### `GET /readings/room/{roomId}?minutes=30`
Returns historical readings for a single room over the last N minutes. Use this for the per-room chart/detail view. Default is 30 minutes.

**Example:** `GET /readings/room/N-101?minutes=30`

**Response:** Array of reading objects (same shape as above), sorted oldest → newest.

### `GET /rooms`
Returns the static config for all 53 rooms. Call this once on app load and cache in state — it does not change.

**Response:**
```json
[
  {
    "roomId": "N-506-5063",
    "floor": 5,
    "roomType": "lab_small",
    "capacity": 20,
    "parentRoom": "N-506",
    "displayName": "Lab N-506 / Bay 3"
  }
]
```

`parentRoom` is only set for N-506 subdivisions (`N-506-5061` through `N-506-5067`). It is `null` for all other rooms.

---

## Data model — what each field means

| Field | Type | Notes |
|---|---|---|
| `roomId` | string | Unique room identifier. Use as React key. |
| `timestamp` | string | ISO 8601 UTC. Convert to local time for display. |
| `temperature` | number | Celsius, 1 decimal place. |
| `humidity` | number | Percentage 0–100. |
| `co2` | number | Parts per million (ppm). |
| `occupancy` | number | Current headcount. |
| `occupancyPct` | number | `occupancy / capacity × 100`. Pre-computed — use this for fill bars. |
| `floor` | number | 1–5. |
| `alertFlags` | string | Comma-separated alert codes or empty string. See alert logic below. |

---

## Alert logic

The Lambda sets `alertFlags` automatically. Parse and display these on room cards:

| Alert code | Condition | Suggested UI treatment |
|---|---|---|
| `TEMP_HIGH` | temperature > 40°C | Red badge |
| `CO2_HIGH` | co2 > 900 ppm | Orange badge |
| `OCCUPANCY_FULL` | occupancyPct >= 100 | Red badge |
| `OCCUPANCY_WARN` | occupancyPct >= 80 | Yellow badge |

Parse with: `alertFlags.split(',').filter(Boolean)`

---

## Suggested React component structure

```
src/
├── App.jsx                  # Router, global state, polling interval
├── api/
│   └── sensors.js           # fetch wrappers for all 3 endpoints
├── hooks/
│   └── useLiveReadings.js   # useEffect + setInterval polling (30s)
├── components/
│   ├── FloorSelector.jsx    # Tab/pill nav for floors 1–5
│   ├── RoomGrid.jsx         # Grid of RoomCard components for selected floor
│   ├── RoomCard.jsx         # Single room: metrics + alert badges
│   ├── OccupancyBar.jsx     # Visual fill bar using occupancyPct
│   ├── RoomDetailModal.jsx  # Click a room → historical chart + full metrics
│   ├── SensorChart.jsx      # Line chart (Chart.js or Recharts) for one metric
│   ├── AlertBanner.jsx      # Top-of-page live alert list (rooms with alertFlags)
│   └── FloorSummary.jsx     # Per-floor aggregate stats (avg temp, total occupancy)
└── utils/
    └── roomHelpers.js       # groupByFloor(), getAlerts(), formatTimestamp()
```

---

## Key implementation notes

### Polling
```js
// useLiveReadings.js
useEffect(() => {
  fetchLatest();
  const id = setInterval(fetchLatest, 30000);
  return () => clearInterval(id);
}, []);
```

### CORS
API Gateway has CORS enabled. All responses include:
```
Access-Control-Allow-Origin: *
```
No proxy setup needed in React.

### Grouping rooms by floor
The `/readings/latest` response is a flat array. Group it client-side:
```js
const byFloor = readings.reduce((acc, r) => {
  (acc[r.floor] = acc[r.floor] || []).push(r);
  return acc;
}, {});
```

### N-506 combined view
Rooms `N-506-5061` through `N-506-5067` are subdivisions of one physical lab. On the floor 5 view, show them individually in a nested group labeled "N-506 (Big Lab)". You can detect them by checking `parentRoom === "N-506"` from the `/rooms` config response.

To show a combined occupancy for N-506:
```js
const n506Rooms = readings.filter(r => r.roomId.startsWith('N-506-'));
const combinedOccupancy = n506Rooms.reduce((sum, r) => sum + r.occupancy, 0);
const combinedCapacity = 7 * 20; // 140
```

### Environment variable
```js
const BASE_URL = process.env.REACT_APP_API_URL;
const res = await fetch(`${BASE_URL}/readings/latest`);
```

---

## Build and deployment

```bash
npm run build
```

Upload the contents of the `build/` folder to the S3 bucket (name TBD). The bucket has static website hosting enabled with `index.html` set as both the index and error document (handles React Router if used).

Do **not** commit `.env` to git. The API URL will be shared separately once the backend is deployed.

---

## Sensor value ranges (for UI calibration)

These are the simulated ranges — use them to set chart Y-axis bounds and colour thresholds:

| Metric | Normal range | Alert threshold |
|---|---|---|
| Temperature | 20–35°C | > 40°C |
| Humidity | 40–70% | — |
| CO₂ | 400–700 ppm | > 900 ppm |
| Occupancy % | 0–100% | ≥ 80% warn, ≥ 100% full |

---

## What is not your responsibility

- Lambda function code
- DynamoDB table setup
- API Gateway configuration
- EventBridge scheduler
- SNS alert emails
- AWS credentials / IAM roles

You only need the `REACT_APP_API_URL` value from the backend developer to connect everything.
