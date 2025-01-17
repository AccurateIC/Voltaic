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

export const BatteryChargeLineChart = ({
  timeStamp,
  batteryVolts,
  chargeAltVolts,
  batteryVoltsIsAnomaly,
  chargeAltVoltsIsAnomaly,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (batteryVolts !== undefined || chargeAltVolts !== undefined) {
      setData((currentData) => {
        if (currentData.length > 150) currentData.shift();

        return [
          ...currentData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            batteryVolts,
            chargeAltVolts,
            batteryVoltsIsAnomaly,
            chargeAltVoltsIsAnomaly,
          },
        ];
      });
    }
  }, [batteryVolts, chargeAltVolts, timeStamp]);

  return (
    <div className="h-[500px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Battery Charge Monitor</h2>
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
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
                dy: 60,
              }}
              domain={["auto", "auto"]}
            />
            <Tooltip />

            <Line
              type="line"
              isAnimationActive={false}
              dataKey="batteryVolts"
              stroke="#5278d1"
              name="Battery Voltage"
              strokeWidth={2}
              dot={(props) =>
                renderCustomDot(props, props.payload.batteryVoltsIsAnomaly)
              }
            />

            <Line
              type="line"
              isAnimationActive={false}
              dataKey="chargeAltVolts"
              stroke="#5dd12c"
              name="Charge Alternator Voltage"
              strokeWidth={2}
              dot={(props) =>
                renderCustomDot(props, props.payload.chargeAltVoltsIsAnomaly)
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
