import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineSpeedLineChart = ({ value }) => {
  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={value} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Engine Speed (RPM)",
                angle: -90,
                position: "insideLeft",
                dy: 60,
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
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="engineSpeed"
              stroke="#5278d1"
              name="Engine Speed"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.engSpeedDisplayIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EngineSpeedLineChart;
