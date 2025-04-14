import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";
import { useEffect } from "react";
import { DateTime } from "luxon";

export const PDMLineChart = ({ value }) => {
  useEffect(() => {
    console.log("PDM");
  });
  return (
    <div className="h-[400px] w-full relative pb-4">
      <h2 className="text-lg font-semibold p-4 text-black">Vibration</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={value}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }} // Add bottom margin
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis
              dataKey="time"
              stroke="#000"
              tickFormatter={(timestamp) => DateTime.fromISO(timestamp).toFormat("HH:mm:ss")}
              label={{ value: "Time(second)", fill: "#000", dy: 7, dx: -30, position: "insideBottom", offset: -10 }}
            />
            <YAxis
              stroke="#000"
              tick={{ fill: "#000" }}
              
              label={{ value: "Vibration (G-Units)", fill: "#000", dy: 60, position: "insideLeft", angle: -90 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }}
              labelFormatter={(timestamp) => DateTime.fromISO(timestamp).toFormat("HH:mm:ss")}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
              name="Vibration Data"
              connectNulls
            />
            {/*
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#8884d8"
              strokeWidth={2}
              // strokeDasharray="5 5" // This creates the dotted/dashed line
              dot={false}
              name="Forecast"
              connectNulls
            />
              */}
            <Legend verticalAlign="top" iconType="diamond" height={36} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PDMLineChart;
