import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const OilPressureLineChart = ({ value }) => {
  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4 text-base-content">Oil Pressure Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={value} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} />
            <YAxis
              label={{
                value: "Pressure (Bar)",
                angle: -90,
                position: "insideLeft",
                dy: 50,
              }}
              domain={[0, 5]}
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
              dataKey="oilPressure"
              stroke="#5278d1"
              strokeWidth={2}
              name= "Oil Pressure"
              dot={{ stroke: '#5278d1', fill: '#5278d1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
