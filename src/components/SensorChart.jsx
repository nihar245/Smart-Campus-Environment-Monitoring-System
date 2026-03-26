import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const METRIC_CONFIG = {
  temperature: {
    label: "Temperature",
    unit: "degC",
    color: "#ff9f43",
    domain: [18, 45],
    threshold: 40
  },
  humidity: {
    label: "Humidity",
    unit: "%",
    color: "#7ae582",
    domain: [20, 90]
  },
  co2: {
    label: "CO2",
    unit: "ppm",
    color: "#ffd166",
    domain: [300, 1400],
    threshold: 900
  },
  occupancyPct: {
    label: "Occupancy",
    unit: "%",
    color: "#70d6ff",
    domain: [0, 120],
    threshold: 80
  }
};

function TrendTooltip({ active, payload, label, metricConfig }) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = Number(payload[0].value);
  return (
    <div className="trend-tooltip">
      <p>{label}</p>
      <strong>
        {value.toFixed(metricConfig.unit === "ppm" ? 0 : 1)} {metricConfig.unit}
      </strong>
    </div>
  );
}

export default function SensorChart({ data, metric = "temperature" }) {
  const metricConfig = METRIC_CONFIG[metric] || METRIC_CONFIG.temperature;

  const rows = data.map((item) => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString()
  }));

  return (
    <div className="sensor-chart">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={rows}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricConfig.color} stopOpacity={0.72} />
              <stop offset="85%" stopColor={metricConfig.color} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255, 255, 255, 0.15)" />
          <XAxis dataKey="time" tick={{ fill: "#d6f0ef", fontSize: 11 }} />
          <YAxis domain={metricConfig.domain} tick={{ fill: "#d6f0ef", fontSize: 11 }} />
          <Tooltip content={<TrendTooltip metricConfig={metricConfig} />} />
          <Legend />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={metricConfig.color}
            strokeWidth={3}
            fill="url(#trendFill)"
            dot={false}
            name={`${metricConfig.label} (${metricConfig.unit})`}
            isAnimationActive
          />
          {metricConfig.threshold ? (
            <ReferenceLine
              y={metricConfig.threshold}
              stroke="#ff595e"
              strokeDasharray="5 5"
              label={{ value: "Alert", position: "insideTopRight", fill: "#ffd0d1", fontSize: 11 }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}