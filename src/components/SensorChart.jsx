import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

export default function SensorChart({ data }) {
  const rows = data.map((item) => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString()
  }));

  return (
    <div className="sensor-chart">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255, 255, 255, 0.15)" />
          <XAxis dataKey="time" tick={{ fill: "#d6f0ef", fontSize: 11 }} />
          <YAxis yAxisId="temp" domain={[20, 45]} tick={{ fill: "#d6f0ef", fontSize: 11 }} />
          <YAxis yAxisId="co2" orientation="right" domain={[300, 1200]} tick={{ fill: "#d6f0ef", fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ff9f43" dot={false} name="Temp (°C)" />
          <Line yAxisId="temp" type="monotone" dataKey="humidity" stroke="#7ae582" dot={false} name="Humidity (%)" />
          <Line yAxisId="co2" type="monotone" dataKey="co2" stroke="#ffd166" dot={false} name="CO₂ (ppm)" />
          <Line yAxisId="temp" type="monotone" dataKey="occupancyPct" stroke="#70d6ff" dot={false} name="Occupancy (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}