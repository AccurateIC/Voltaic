/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import renderCustomDot from "./renderCustomDot";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const GeneratorCurrentLineChart = ({ l1Current, l2Current, l3Current }) => {
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    if (
      Array.isArray(l1Current) &&
      l1Current.length > 0 &&
      Array.isArray(l2Current) &&
      l2Current.length > 0 &&
      Array.isArray(l3Current) &&
      l3Current.length > 0
    ) {
      const newData = l1Current.map((l1Item) => {
        const l2Item = l2Current.find((item) => item.timestamp === l1Item.timestamp);
        const l3Item = l3Current.find((item) => item.timestamp === l1Item.timestamp);
        const time = new Date(l1Item.timestamp);

        return {
          time: time.toLocaleTimeString(),
          L1: l1Item.propertyValue,
          L2: l2Item ? l2Item.propertyValue : null,
          L3: l3Item ? l3Item.propertyValue : null,
          l1CIsAnomaly: l1Item.isAnomaly,
          l2CIsAnomaly: l2Item ? l2Item.isAnomaly : null,
          l3CIsAnomaly: l3Item ? l3Item.isAnomaly : null,
        };
      });

      setCurrentData(newData);
    }
  }, [l1Current, l2Current, l3Current]);

  useEffect(() => {
    console.log("currentData", currentData);
  }, [currentData]);

  return (
    <div className="h-[400px] w-full relative pb-6">
      <h2 className="text-lg font-semibold p-4">Generator Current Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Current (A)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 30]}
            />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              iconType="current"
              wrapperStyle={{ paddingBottom: 15 }}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L1"
              stroke="#5dd12c"
              name="L1 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l1CIsAnomaly)}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L2"
              stroke="#ede907"
              name="L2 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l2CIsAnomaly)}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L3"
              stroke="#5278d1"
              name="L3 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l3CIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
