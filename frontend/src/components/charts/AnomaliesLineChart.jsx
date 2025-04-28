import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Helper to format timestamp in 12-hour format
const formatTime12Hour = (timestamp) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // hour 0 should be 12

  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${hours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
};

// Custom dot for anomaly highlighting
const CustomDot = (props) => {
  const { cx, cy, payload } = props;

  if (payload.isAnomaly) {
    return <circle cx={cx} cy={cy} r={6} stroke="red" strokeWidth={2} fill="red" />;
  } else {
    return <circle cx={cx} cy={cy} r={5} stroke="#5278d1" strokeWidth={2} fill="#5278d1" />;
  }
};

const AnomaliesLineChart = ({ value }) => {
  if (!value || value.length === 0) return <div></div>;

  // Find min and max property values
  const propertyValues = value.map((item) => item.propertyValue);
  const minY = Math.min(...propertyValues);
  const maxY = Math.max(...propertyValues);

  // Y-axis title from propertyName
  const yAxisTitle = value[0]?.gensetProperty?.propertyName || "Property Value";

  // 🔥 Sort data by timestamp ascending
  const sortedData = [...value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Format data: add 'time' field formatted
  const formattedData = sortedData.map((item) => ({
    ...item,
    time: formatTime12Hour(item.timestamp),
  }));

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4 text-base-content">{yAxisTitle} Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} interval="preserveStartEnd" />
            <YAxis
              label={{
                value: yAxisTitle,
                angle: -90,
                position: "insideLeft",
                dy: 50,
              }}
              domain={[minY - 5, maxY + 5]}
            />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 15 }}
            />
            <Line
              type="monotone"
              dataKey="propertyValue"
              stroke="#5278d1"
              strokeWidth={2}
              name={yAxisTitle}
              dot={<CustomDot />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnomaliesLineChart;
