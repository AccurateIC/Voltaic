import React, { useState, useEffect, useRef } from "react";
import renderCustomDot from "./renderCustomDot";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const GeneratorVoltageLineChart = ({
 
  l1Voltage,
  l2Voltage,
  l3Voltage,
  
}) => {
  const [graphData, setGraphData] = useState([]);
  const [notifications, setNotifications] = useState([]);


   useEffect(() => {
    
      if (
        Array.isArray(l1Voltage) &&
        l1Voltage.length > 0 &&
        Array.isArray(l2Voltage) &&
        l2Voltage.length > 0 &&
        Array.isArray(l3Voltage) &&
        l3Voltage.length > 0
      ) {
  
        const newData = l1Voltage.map((l1Item) => {
          // Find the corresponding items in l2Current and l3Current based on the timestamp
          const l2Item = l2Voltage.find((item) => item.timestamp === l1Item.timestamp);
          const l3Item = l3Voltage.find((item) => item.timestamp === l1Item.timestamp);
  
          // Format the time from timestamp (using `new Date()` for converting timestamp to Date)
          const time = new Date(l1Item.timestamp);
  
          return {
            time: time.toLocaleTimeString(), // Use the formatted time
            L1: l1Item.propertyValue,
            L2: l2Item ? l2Item.propertyValue : null, // If no match, set to null
            L3: l3Item ? l3Item.propertyValue : null, // If no match, set to null
            l1IsAnomaly: l1Item.isAnomaly,
            l2IsAnomaly: l2Item ? l2Item.isAnomaly : null, // If no match, set to null
            l3IsAnomaly: l3Item ? l3Item.isAnomaly : null, // If no match, set to null
          };
        });
  
        setGraphData(newData); // Set the merged data to the state
      }
    }, [l1Voltage, l2Voltage, l3Voltage]);
   
  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Generator Voltage Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData} margin={{ top: 1, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} />
            <YAxis
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
              }}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};