import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";
import { useEffect } from "react";

export const PDMLineChart = () => {
    useEffect(()=>{
        console.log("PDM");
    });
  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4 text-black">Predictive Maintenance</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Vibration Acceleration (g) ",
                angle: -90,
                position: "insideLeft",
                dy: 60,
              }}
              domain={[-2, 2]}
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
              name="Normal"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.engSpeedDisplayIsAnomaly)}
            />
            <Line
              stroke="#ff0000"
              name="Abnormal"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PDMLineChart;
