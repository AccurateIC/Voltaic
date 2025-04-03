import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineSpeedLineChart = ({ value }) => {
  return (
    <div className="h-[400px] w-full relative pb-4">
      <h2 className="text-lg font-semibold p-4  text-base-content">Engine Speed Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={value} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time"  stroke="#000" label={{ value: "Time(seconds)",fill:"#000",dy:7, dx:-30, position: "bottom", offset: 0 }} />
            <YAxis
              label={{
                value: "Engine Speed (RPM)",
                angle: -90,
                position: "insideLeft",
                dy: 50,
                dx:-10,
                fill: "#000"
              }}
              stroke="#000"
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
              <Line
              stroke="#ff0000"
              name="Anomaly"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EngineSpeedLineChart;
