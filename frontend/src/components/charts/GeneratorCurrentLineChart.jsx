/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import renderCustomDot from "./renderCustomDot";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const GeneratorCurrentLineChart = ({value }) => {
  const [currentData, setCurrentData] = useState([]);
useEffect(() => {

    if (Array.isArray(value) && value.length > 0) {
    
      const newData = value.map((item) => ({
        time:item.time, 
        L1: item.L1,
        L2: item.L2,
        L3: item.L3,
        l1CIsAnomaly: item.l1CIsAnomaly,
        l2CIsAnomaly: item.l2CIsAnomaly, 
        l3CIsAnomaly: item.l3CIsAnomaly, 
      }));
      setCurrentData(newData);
    }

  }, [value]);

  
  useEffect(()=>{
    console.log("currentData mapped in report page",currentData );
  },[currentData]);

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
