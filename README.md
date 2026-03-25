# Smart Campus Environment Monitoring System

React dashboard for real-time environmental monitoring across all 53 rooms in N Block, including:

- Live floor-wise dashboard with polling every 30 seconds
- Alert banner and alert badges from backend alert flags
- Room detail modal with 30-minute historical trend charts
- Floor summary analytics
- Interactive 3D N Block sensor map with per-room sensor positions

## Tech

- React + Vite
- React Router
- Recharts
- Three.js with @react-three/fiber and @react-three/drei

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file from `.env.example` and set your API URL.

3. Start development server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

## Environment variable

Use either of these (both are supported):

- `VITE_API_URL`
- `REACT_APP_API_URL` (compatibility with your original context)

Expected API shape:

- `GET /readings/latest`
- `GET /rooms`
- `GET /readings/room/{roomId}?minutes=30`