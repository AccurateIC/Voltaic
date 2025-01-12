import React, { useState, useEffect, useRef } from "react";
import { CiBellOn } from "react-icons/ci"; // Bell icon from react-icons
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import renderCustomDot from "./renderCustomDot"; // Assuming you have this custom dot renderer

export const GeneratorVoltageLineChart = ({
  timeStamp,
  l1Voltage,
  l2Voltage,
  l3Voltage,
  l1IsAnomaly,
  l2IsAnomaly,
  l3IsAnomaly,
}) => {
  const [data, setData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false); // Track if notification list should be shown

  // Refs to track whether notifications have been shown for each anomaly
  const l1NotificationRef = useRef(false);
  const l2NotificationRef = useRef(false);
  const l3NotificationRef = useRef(false);

  useEffect(() => {
    // Update chart data
    if (l1Voltage !== 0 && l2Voltage !== 0 && l3Voltage !== 0) {
      setData((currentData) => {
        if (currentData.length > 48) currentData.shift(); // Remove the oldest entry

        return [
          ...currentData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            L1: l1Voltage,
            L2: l2Voltage,
            L3: l3Voltage,
            l1IsAnomaly,
            l2IsAnomaly,
            l3IsAnomaly,
          },
        ];
      });
    }

    // Handle notifications
    // For L1 phase
    if (l1IsAnomaly && !l1NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L1", message: "Anomaly detected in L1 phase!" },
      ]);
      l1NotificationRef.current = true; // Mark as shown
    }

    if (!l1IsAnomaly && l1NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L1")
      );
      l1NotificationRef.current = false; // Reset flag when anomaly is cleared
    }

    // For L2 phase
    if (l2IsAnomaly && !l2NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L2", message: "Anomaly detected in L2 phase!" },
      ]);
      l2NotificationRef.current = true; // Mark as shown
    }

    if (!l2IsAnomaly && l2NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L2")
      );
      l2NotificationRef.current = false; // Reset flag when anomaly is cleared
    }

    // For L3 phase
    if (l3IsAnomaly && !l3NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L3", message: "Anomaly detected in L3 phase!" },
      ]);
      l3NotificationRef.current = true; // Mark as shown
    }

    if (!l3IsAnomaly && l3NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L3")
      );
      l3NotificationRef.current = false; // Reset flag when anomaly is cleared
    }

  }, [l1Voltage, l2Voltage, l3Voltage, timeStamp, l1IsAnomaly, l2IsAnomaly, l3IsAnomaly]);

  // Handle the notification toggle
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
 console.log(l1Voltage);
 

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Generator Voltage Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time", position: "bottom", offset: 0 }}
            />
            <YAxis
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={["auto", "auto"]} // Auto-scale based on data
            />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="L1"
              stroke="#CAA98F" // Very light terra cotta
              name="L1 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l1IsAnomaly)}
            />
            <Line
              type="monotone"
              dataKey="L2"
              stroke="#B3CC99" // Very light olive
              name="L2 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l2IsAnomaly)}
            />
            <Line
              type="monotone"
              dataKey="L3"
              stroke="#99B3CC" // Very light steel blue
              name="L3 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l3IsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Notification Bell Icon */}
      <div
        className="relative cursor-pointer"
        onClick={toggleNotifications}
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        <CiBellOn size={30} color="black" />
        {notifications.length > 0 && (
          <div
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs"
            style={{ fontSize: "12px" }}
          >
            {notifications.length}
          </div>
        )}
      </div>

      {/* Notification Dropdown */}
      {showNotifications && notifications.length > 0 && (
        <div
          className="absolute top-12 right-0 bg-white border border-gray-300 shadow-md w-60 max-h-60 overflow-y-auto"
          style={{ zIndex: 10 }}
        >
          <ul className="p-2">
            {notifications.map((notification, index) => (
              <li key={index} className="p-2 border-b">
                {notification.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
