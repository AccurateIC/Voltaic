import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import renderCustomDot from "./renderCustomDot";
export const EngineSpeedLineChart = ({
  timeStamp,
  value,
  engSpeedIsAnomaly,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (value !== undefined) {
      setData((currentData) => {
        if (currentData.length > 150) currentData.shift();

        return [
          ...currentData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            engineSpeed: value,
            engSpeedIsAnomaly,
          },
        ];
      });
    }
  }, [value]);

  return (
    <div className="h-[500px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, bottom: 30, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Engine Speed (RPM)",
                angle: -90,
                position: "insideLeft",
                dy: 60,
              }}
              domain={["auto", "auto"]}
            />

            <Tooltip />
            {/* <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="voltage"
              wrapperStyle={{ paddingBottom: 15 }}
            /> */}
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="engineSpeed"
              stroke="#5278d1"
              name="Engine Speed"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.engSpeedIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
