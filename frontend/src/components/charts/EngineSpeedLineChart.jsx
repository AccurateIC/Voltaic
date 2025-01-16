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
        if (currentData.length > 120) currentData.shift();

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
    
     <div className="h-[400px] w-full relative">
          <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>
          <div className="h-[calc(100%-3rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                  label={{
                    value: "Engine Speed (RPM)",
                    angle: -90,
                    position: "insideLeft",
                    dy: 60,
                  }}
                  ticks={[0, 500, 1000, 1500, 2000]}
                  />
            <Tooltip />
            
            <Line
              type="monotone"
              isAnimationActive={false}
              dataKey="engineSpeed"
              stroke="#5dd12c"
              name="Engine Speed"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, engSpeedIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
