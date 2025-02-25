

import React, { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineSpeedLineChart = ({ value }) => {
  
  const [engineSpeedData, setEngineSpeedData] = useState([]);
  const [notifications, setNotifications] = useState([]);
 

  const engineSpeedNotificationRef = useRef(false);

  useEffect(() => {
    if (Array.isArray(value) && value.length > 0) {
      // Map the value array into the format expected by the chart
      const newData = value.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString(), 
        engineSpeed: item.propertyValue, 
        engSpeedDisplayIsAnomaly: item.isAnomaly, 
      }));
      setEngineSpeedData(newData);
    
    }
  }, [value]); 

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>

      {/* Display notifications */}
      {/* <div className="absolute top-0 right-0 p-4">
        {notifications.length > 0 && (
          <div className="bg-white border border-gray-300 shadow-md p-2">
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id} className="p-2 border-b text-sm">
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div> */}

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={engineSpeedData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: "Engine Speed (RPM)", angle: -90, position: "insideLeft", dy: 60 }} domain={[0, 2000]} />
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
