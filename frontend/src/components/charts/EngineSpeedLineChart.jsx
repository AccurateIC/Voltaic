import React, { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineSpeedLineChart = ({ timeStamp, value, engSpeedDisplayIsAnomaly }) => {
  // Local state for storing engine speed data and notifications
  const [engineSpeedData, setEngineSpeedData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Ref to track if the anomaly notification has been shown
  const engineSpeedNotificationRef = useRef(false);

  useEffect(() => {
    // console.log("useEffect triggered", { value, timeStamp, engSpeedDisplayIsAnomaly });

    if (value !== undefined) {
      setEngineSpeedData(prevData => [
        ...prevData,
        {
          time: new Date(timeStamp).toLocaleTimeString(),
          engineSpeed: value,
          engSpeedDisplayIsAnomaly: engSpeedDisplayIsAnomaly,
        },
      ]);
    }

    if (engSpeedDisplayIsAnomaly && !engineSpeedNotificationRef.current) {
      // console.log("Anomaly detected, setting notification");
      setNotifications(prevNotifications => [
        ...prevNotifications,
        {
          id: "engineSpeedAnomaly",
          message: "Engine speed anomaly detected!",
          type: "engineSpeed",
        },
      ]);
      engineSpeedNotificationRef.current = true;
    } else if (!engSpeedDisplayIsAnomaly && engineSpeedNotificationRef.current) {
      console.log("Anomaly cleared, removing notification");
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== "engineSpeedAnomaly")
      );
      engineSpeedNotificationRef.current = false;
    }
  }, [value, timeStamp, engSpeedDisplayIsAnomaly]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>

      {/* Display notifications */}
      <div className="absolute top-0 right-0 p-4">
        {notifications.length > 0 && (
          <div className="bg-white border border-gray-300 shadow-md p-2">
            <ul>
              {notifications.map(notification => (
                <li key={notification.id} className="p-2 border-b text-sm">
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
              dot={props => {
                // console.log("Rendering dot", props);
                return renderCustomDot(props, props.payload.engSpeedDisplayIsAnomaly);
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};