import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const OilPressureLineChart = ({ timeStamp, oilPressure, oilPressureIsAnomaly }) => {
  // Local state to store graph data and notifications
  const [oilPressureData, setOilPressureData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const oilPressureNotificationRef = useRef(false);

  useEffect(() => {
    // Add new oil pressure data to the graph
    if (oilPressure !== 0) {
      setOilPressureData((prevData) => [
        ...prevData,
        {
          time: new Date(timeStamp).toLocaleTimeString(),
          oilPressure,
          oilPressureIsAnomaly,
        },
      ]);
    }

    // Handle oil pressure anomaly notification
    if (oilPressureIsAnomaly && !oilPressureNotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          id: "oilPressure",
          message: "Oil pressure anomaly detected!",
          type: "oilPressure",
        },
      ]);
      oilPressureNotificationRef.current = true;
    } else if (!oilPressureIsAnomaly && oilPressureNotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "oilPressure")
      );
      oilPressureNotificationRef.current = false;
    }
  }, [timeStamp, oilPressure, oilPressureIsAnomaly]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Oil Pressure Monitor</h2>

      {/* Notifications display
      <div className="absolute top-1 right-4 text-xl font-semibold p-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="text-red-600">
            {notification.message}
          </div>
        ))}
      </div> */}

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={oilPressureData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
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

