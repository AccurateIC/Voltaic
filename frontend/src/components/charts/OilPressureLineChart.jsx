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
          oilPressureNotificationRef.current = false;
        }
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
              dataKey="time"
              label={{ value: "Time", position: "bottom", offset: 0 }}
              tick={{ textAnchor: "end" }}
            />
            <YAxis
              label={{
                value: "Oil Pressure (Bar)",
                angle: -90,
                position: "insideLeft",
              }}
              ticks={[0, 2, 4, 6]}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="oilPressure"
              stroke="#B3CC99"
              name="Oil Pressure"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l3IsAnomaly)}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Notification Bell Icon */}
      

     
    </div>
  );
};

export default OilPressureLineChart;
