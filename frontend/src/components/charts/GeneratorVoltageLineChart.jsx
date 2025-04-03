import React from "react";
import renderCustomDot from "./renderCustomDot";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const GeneratorVoltageLineChart = ({ value }) => {
  return (
    <div className="h-[400px] w-full relative pb-4">
      <h2 className="text-lg font-semibold p-4  text-black text-base-content">Generator Voltage</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={value} margin={{ top: 1, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="time" stroke="#000" label={{ value: "Time(seconds)",dy:7, dx:-30,fill:"#000", position: "bottom", offset: 0 }} />
            <YAxis
              label={{
                value: "Voltage (Volts)",
                angle: -90,
                position: "insideLeft",
                fill:"#000",
                dy:50,
              }}
              stroke="#000"
              domain={[0, 300]}
            />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="voltage"
              wrapperStyle={{ paddingBottom: 15 }}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L1"
              stroke="#5dd12c"
              name="L1 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l1IsAnomaly)}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L2"
              stroke="#ede907"
              name="L2 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l2IsAnomaly)}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L3"
              stroke="#5278d1"
              name="L3 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l3IsAnomaly)}
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
