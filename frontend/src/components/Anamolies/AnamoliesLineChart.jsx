import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const lineData = [
  { hour: "12 PM", count: 3 },
  { hour: "2 PM", count: 5 },
  { hour: "4 PM", count: 7 },
  { hour: "6 PM", count: 6 },
  { hour: "8 PM", count: 4 },
  { hour: "10 PM", count: 1 },
  { hour: "12 AM", count: 4 },
  { hour: "2 AM", count: 5 },
  { hour: "4 AM", count: 7 },
  { hour: "6 AM", count: 2 },
  { hour: "8 AM", count: 4 },
  { hour: "10 AM", count: 5 },
  { hour: "12 PM", count: 3 },
];

const AnomaliesLineChart = () => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg flex justify-center items-center">
      <div className="w-full max-w-3xl">
        <h2 className="text-center mb-5 font-bold text-white text-lg md:text-xl">
          Total Number of Anomalies in 24 Hours
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="1 1" />
            <XAxis dataKey="hour" tick={{ fill: "#fff", fontSize: 16 }}>
              <Label
                value="Time (in hours)"
                position="insideBottom"
                offset={-15}
                style={{ fill: "#fff", fontSize:14 }}
              />
            </XAxis>
            <YAxis tick={{ fill: "#fff", fontSize:14 }}>
              <Label
                value="Anomaly Count"
                angle={-90}
                position="insideLeft"
                style={{ fill: "#fff", fontSize:14 }}
              />
            </YAxis>
            <Tooltip />
            <Legend wrapperStyle={{ color: "#fff", fontSize: 14, marginBottom: "-25px" }} />
            {lineData.map((data, index) => (
              <ReferenceLine
                key={index}
                x={data.hour}
                stroke="#FF0000"
                strokeDasharray="3 3"
              />
            ))}
            <Line
              type="monotone"
              dataKey="count"
              name="Anomaly in a Day"
              stroke="#42A5F5"
              strokeWidth={2}
              dot={{ r: 4 }}
              
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnomaliesLineChart;
