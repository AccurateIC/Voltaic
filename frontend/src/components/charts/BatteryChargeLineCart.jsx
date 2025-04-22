import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const BatteryChargeLineChart = ({ value }) => {
  const now = new Date();
  const timeOnly = now.toLocaleTimeString(); 
  const xAxisStart = new Date(now.getTime() - 3600 * 1000);
  const startAt = xAxisStart.toLocaleTimeString();

  const fallbackData = [
    { time: startAt },
    { time: timeOnly },
  ];

  const batteryChargeValue = value && value.length ? value : fallbackData;
  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4 text-base-content">Battery Charge Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={batteryChargeValue} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} />
            <YAxis
              label={{
                value: "Voltage (Volts)",
                angle: -90,
                position: "insideLeft",
                dy: 60,
              }}
              domain={[0, 15]}
            />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="engine"
              wrapperStyle={{ paddingBottom: 15 }}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="batteryVolts"
              stroke="#5278d1"
              name="Battery Voltage"
              strokeWidth={2}
              dot={{ stroke: '#5278d1', fill: '#5278d1' }}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="chargeAltVolts"
              stroke="#5dd12c"
              name="Charge Alternator Voltage"
              strokeWidth={2}
              dot={{ stroke: '#5278d1', fill: '#5dd12c' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
