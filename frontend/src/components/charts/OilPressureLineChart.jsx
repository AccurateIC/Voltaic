import { useState, useEffect, useRef } from "react";
import { CiBellOn } from "react-icons/ci";
import renderCustomDot from "./renderCustomDot";
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

export const OilPressureLineChart = () => {
  const [data, setData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const oilPressureNotificationRef = useRef(false);

  useEffect(() => {
    
    const socket = new WebSocket("ws://localhost:8766");

    socket.onopen = () => {
      console.log("Connected to WebSocket server.");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      const oilPressureData = message.engOilPress; 
      const timestamp = message.timestamp;  

    
      if (oilPressureData) {
        const oilPressure = oilPressureData.value;

        
        setData((currentData) => {
          if (currentData.length >= 48) currentData.shift(); 
          return [
            ...currentData,
            {
              time: new Date(timestamp).toLocaleTimeString(),
              oilPressure: oilPressure,
            },
          ];
        });

        // Handle anomaly notification
        if (oilPressureData.is_anomaly && !oilPressureNotificationRef.current) {
          setNotifications((prev) => [
            ...prev,
            { id: "oilPressure", message: `Anomaly detected in oil pressure!` },
          ]);
          oilPressureNotificationRef.current = true; // Mark as shown
        }

        if (!oilPressureData.is_anomaly && oilPressureNotificationRef.current) {
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== "oilPressure")
          );
          oilPressureNotificationRef.current = false;  }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    return () => {
      socket.close();
    };
  }, []);

  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Oil Pressure Monitor</h2>
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
              dataKey="time"  // Ensure that the data key for X-Axis is 'time' in your data structure
              label={{ value: "Time", position: "bottom", offset: 0 }}
              tick={{ textAnchor: "end" }}  // Rotate the X-axis labels for better visibility
            />
            <YAxis
              label={{
                value: "Oil Pressure (Bar)",
                angle: -90,
                position: "insideLeft",
              }}
              ticks={[0, 2,  4, 6]} // You can adjust these ticks as necessary
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="oilPressure"
              stroke="#B3CC99" // Light Olive for oil pressure
              name="Oil Pressure"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l3IsAnomaly)}
              activeDot={{ r: 8 }}
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

export default OilPressureLineChart;
