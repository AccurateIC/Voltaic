import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineSpeedLineChart = ({ value }) => {
  const now = new Date();
  const timeOnly = now.toLocaleTimeString();
  const xAxisStart = new Date(now.getTime() - 3600 * 1000);
  const startAt = xAxisStart.toLocaleTimeString();

  const fallbackData = [{ time: startAt }, { time: timeOnly }];
  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4 text-base-content">Engine Speed Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          {/* <LineChart data={value} margin={{ top: 10, right: 30, bottom: 30, left: 30 }}> */}
          <LineChart
            data={value && value.length ? value : fallbackData}
            margin={{ top: 10, right: 30, bottom: 30, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} />
            <YAxis
              label={{
                value: "Engine Speed (RPM)",
                angle: -90,
                position: "insideLeft",
                dy: 60,
                dx: -10,
              }}
              domain={[0, 2000]}
            />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="engine"
              wrapperStyle={{ paddingBottom: 15 }}
            />
            {value && value.length > 0 && (
              <Line
                type="line"
                isAnimationActive={false}
                dataKey="engineSpeed"
                stroke="#5278d1"
                name="Engine Speed"
                strokeWidth={2}
                dot={{ stroke: "#5278d1", fill: "#5278d1" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EngineSpeedLineChart;
