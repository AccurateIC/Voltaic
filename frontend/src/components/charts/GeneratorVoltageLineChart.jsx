


import React, { useState, useEffect, useRef } from "react";
import renderCustomDot from "./renderCustomDot";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const GeneratorVoltageLineChart = ({
  timeStamp,
  l1Voltage,
  l2Voltage,
  l3Voltage,
  l1IsAnomaly,
  l2IsAnomaly,
  l3IsAnomaly,
}) => {
  const [graphData, setGraphData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const l1NotificationRef = useRef(false);
  const l2NotificationRef = useRef(false);
  const l3NotificationRef = useRef(false);

  useEffect(() => {
    // Add new data to the graph when voltage is updated
    if (l1Voltage !== 0 || l2Voltage !== 0 || l3Voltage !== 0) {
      setGraphData((prevData) => [
        ...prevData,
        {
          time: new Date(timeStamp).toLocaleTimeString(),
          L1: l1Voltage,
          L2: l2Voltage,
          L3: l3Voltage,
          l1IsAnomaly,
          l2IsAnomaly,
          l3IsAnomaly,
        },
      ]);
    }

    // Handle L1 anomaly notifications
    if (l1IsAnomaly && !l1NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L1", message: "Voltage anomaly detected in L1 phase!", type: "voltage" },
      ]);
      l1NotificationRef.current = true;
    } else if (!l1IsAnomaly && l1NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L1")
      );
      l1NotificationRef.current = false;
    }

    // Handle L2 anomaly notifications
    if (l2IsAnomaly && !l2NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L2", message: "Voltage anomaly detected in L2 phase!", type: "voltage" },
      ]);
      l2NotificationRef.current = true;
    } else if (!l2IsAnomaly && l2NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L2")
      );
      l2NotificationRef.current = false;
    }

    // Handle L3 anomaly notifications
    if (l3IsAnomaly && !l3NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L3", message: "Voltage anomaly detected in L3 phase!", type: "voltage" },
      ]);
      l3NotificationRef.current = true;
    } else if (!l3IsAnomaly && l3NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L3")
      );
      l3NotificationRef.current = false;
    }
  }, [timeStamp, l1Voltage, l2Voltage, l3Voltage, l1IsAnomaly, l2IsAnomaly, l3IsAnomaly]);

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

      {/* Display notifications */}
      {/* <div className="absolute top-1 right-4 text-xl font-semibold p-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="text-black">
            {notification.message}
          </div>
        ))}
      </div> */}
    </div>
  );
};