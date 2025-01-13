import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const EngineSpeedLineChart = ({ value, timeStamp }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (value !== undefined) {
      setData((currentData) => {
        if (currentData.length > 48) currentData.shift(); // remove the oldest entry

        return [
          ...currentData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            engineSpeed: value,
          },
        ];
      });
    }
  }, [value]);

  return (
    <div className="h-[400px] w-full">
      <h2 className="text-lg font-semibold p-4">Engine Speed</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time", position: "bottom", offset: 0 }}
            />
            <YAxis
              label={{
                value: "Engine Speed (RPM)",
                angle: -90,
                position: "insideleft",
              }}
              ticks={[0, 500, 1000, 1500, 2000]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="engineSpeed"
              stroke="#2563eb"
              name="Engine Speed"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
