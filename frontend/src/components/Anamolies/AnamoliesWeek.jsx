import React from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Label,
  ResponsiveContainer,
} from "recharts";

const weekData = [
  { type: "A", count: 2 },
  { type: "B", count: 4 },
  { type: "C", count: 8 },
  { type: "D", count: 10 },
  { type: "E", count: 6 },
  { type: "F", count: 9 },
  { type: "G", count: 2 },
];

const AnomalyWeek = () => {
  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-lg flex justify-center items-center w-full">
      <div className="w-full max-w-4xl">
        <h2 className="text-center mb-4 md:mb-5 font-bold text-white text-lg md:text-xl">
          Number of Anomalies in Past Week
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weekData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="type" tick={{ fill: "#fff", fontSize: 16 }}>
              <Label
                value="Type of Anomaly"
                position="insideBottom"
                offset={-15}
                style={{ fill: "#fff", fontSize: 14 }}
              />
            </XAxis>
            <YAxis tick={{ fill: "#fff", fontSize: 14 }}>
              <Label
                value="Anomaly Count"
                angle={-90}
                position="insideLeft"
                style={{ fill: "#fff", fontSize: 14 }}
              />
            </YAxis>
            <Tooltip contentStyle={{ backgroundColor: "#222", border: "none", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#fff", fontSize: 14, marginBottom: "-25px" }} />

            <Line
              type="monotone"
              dataKey="count"
              name="Anomaly in a Week"
              stroke="#FFFF66"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnomalyWeek;
