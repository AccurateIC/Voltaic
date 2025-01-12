import React, { useState, useEffect, useRef } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import renderCustomDot from "./renderCustomDot";

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

  // Refs to track whether notifications have been shown for each anomaly
  const l1NotificationRef = useRef(false);
  const l2NotificationRef = useRef(false);
  const l3NotificationRef = useRef(false);

  useEffect(() => {
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

    
    if (l1IsAnomaly && !l1NotificationRef.current) {
      toast.error("Anomaly detected in L1 phase!");
      l1NotificationRef.current = true; 
    }

    if (l2IsAnomaly && !l2NotificationRef.current) {
      toast.error("Anomaly detected in L2 phase!");
      l2NotificationRef.current = true; 
    }

    if (l3IsAnomaly && !l3NotificationRef.current) {
      toast.error("Anomaly detected in L3 phase!");
      l3NotificationRef.current = true; 
    }

    
    return () => {
      
      if (!l1IsAnomaly) l1NotificationRef.current = false;
      if (!l2IsAnomaly) l2NotificationRef.current = false;
      if (!l3IsAnomaly) l3NotificationRef.current = false;
    };
  }, [
    l1Voltage,
    l2Voltage,
    l3Voltage,
    timeStamp,
    l1IsAnomaly,
    l2IsAnomaly,
    l3IsAnomaly,
  ]);

  return (
    <div className="h-[400px] w-full">
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

     
      <ToastContainer />
    </div>
  );
};
