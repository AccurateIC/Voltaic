import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const OilPressureLineChart = ({ value }) => {
  // Local state to store graph data and notifications
  // const [oilPressureData, setOilPressureData] = useState([]);
  // const [notifications, setNotifications] = useState([]);

  // const oilPressureNotificationRef = useRef(false);

  // useEffect(() => {
  //   // Add new oil pressure data to the graph
   
  //   if (Array.isArray(value) && value.length > 0) {
  //     // Map the value array into the format expected by the chart
  //     const newData = value.map((item) => ({
  //       time: new Date(item.timestamp).toLocaleTimeString(), // Format timestamp to string
  //       oilPressure: item.propertyValue, // Get the engine speed value
  //       oilPressureIsAnomaly: item.isAnomaly, // Include anomaly flag
  //     }));
  //     setOilPressureData(newData);
      
  //   }

  // }, [value]);


  
  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Oil Pressure Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={value} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Pressure (Bar)",
                angle: -90,
                position: "insideLeft",
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
              dot={(props) => renderCustomDot(props, props.payload.oilPressureIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
