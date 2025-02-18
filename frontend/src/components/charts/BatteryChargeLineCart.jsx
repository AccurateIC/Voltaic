import React, { useEffect, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const BatteryChargeLineChart = ({
  timeStamp,
  batteryVolts,
  chargeAltVolts,
  batteryVoltsIsAnomaly,
  chargeAltVoltsIsAnomaly,
}) => {
  // Local state for storing battery data and notifications
  const [batteryData, setBatteryData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Refs for tracking if the anomaly notification has been displayed
  const batteryVoltsNotificationRef = useRef(false);
  const chargeAltVoltsNotificationRef = useRef(false);

  useEffect(() => {
    if (batteryVolts !== undefined || chargeAltVolts !== undefined) {
      setBatteryData((prevData) => [
        ...prevData,
        {
          time: new Date(timeStamp).toLocaleTimeString(),
          batteryVolts,
          chargeAltVolts,
          batteryVoltsIsAnomaly,
          chargeAltVoltsIsAnomaly,
        },
      ]);
    }

    // Handle battery voltage anomaly notifications
    if (batteryVoltsIsAnomaly && !batteryVoltsNotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "batteryVolts", message: "Battery voltage anomaly detected!", type: "battery" },
      ]);
      batteryVoltsNotificationRef.current = true;
    } else if (!batteryVoltsIsAnomaly && batteryVoltsNotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "batteryVolts")
      );
      batteryVoltsNotificationRef.current = false;
    }

    // Handle charge alternator voltage anomaly notifications
    if (chargeAltVoltsIsAnomaly && !chargeAltVoltsNotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "chargeAltVolts", message: "Charge alternator voltage anomaly detected!", type: "chargeAlt" },
      ]);
      chargeAltVoltsNotificationRef.current = true;
    } else if (!chargeAltVoltsIsAnomaly && chargeAltVoltsNotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "chargeAltVolts")
      );
      chargeAltVoltsNotificationRef.current = false;
    }
  }, [timeStamp, batteryVolts, chargeAltVolts, batteryVoltsIsAnomaly, chargeAltVoltsIsAnomaly]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Battery Charge Monitor</h2>

      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={batteryData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
                dy: 60,
              }}
              domain={[0, 15]}
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
              dataKey="batteryVolts"
              stroke="#5278d1"
              name="Battery Voltage"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.batteryVoltsIsAnomaly)}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="chargeAltVolts"
              stroke="#5dd12c"
              name="Charge Alternator Voltage"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.chargeAltVoltsIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

