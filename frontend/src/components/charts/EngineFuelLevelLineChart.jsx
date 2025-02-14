import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineFuelLevelLineChart = ({ timeStamp, fuelLevel, fuelLevelISAnomaly }) => {
  const [fuelLevelData, setFuelLevelData] = useState([]); // Add this line to define the state for fuelLevelData
  const [notifications, setNotifications] = useState([]);
  const fuelLevelNotificationRef = useRef(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getAll`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Response", data);
        } else {
          console.log("error", response.status);
        }
      } catch (error) {
        console.error("Fetcherroe", error);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (fuelLevel !== -1) {
      setFuelLevelData((prevData) => [
        ...prevData,
        {
          time: new Date(timeStamp).toLocaleTimeString(),
          fuelLevel,
          fuelLevelIsAnomaly: fuelLevelISAnomaly, // Corrected variable name here
        },
      ]);
    }

    if (fuelLevelISAnomaly && !fuelLevelNotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "fuelLevelAnomaly", message: "Fuel level anomaly detected!", type: "fuel" },
      ]);
      fuelLevelNotificationRef.current = true;
    } else if (!fuelLevelISAnomaly && fuelLevelNotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "fuelLevelAnomaly")
      );
      fuelLevelNotificationRef.current = false;
    }
  }, [fuelLevel, timeStamp, fuelLevelISAnomaly]);

  return (
    <div className="h-[400px] w-full">
      <h2 className="text-lg font-semibold p-4">Engine Fuel Level Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fuelLevelData} margin={{ top: 15, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} />
            <YAxis
              label={{
                value: "Fuel Level (%)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 60]}
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
              dataKey="fuelLevel"
              stroke="#5278d1"
              name="Fuel Level"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.fuelLevelIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
