
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineFuelLevelLineChart = ({ fuelLevelData }) => {
  useEffect(() => {
    console.log("fuelLevelData", fuelLevelData);
  }, [fuelLevelData]);

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
              domain={[0, 100]}  // Adjust based on the fuel level range
            />
            <Tooltip
              content={({ active, label }) => {
                if (!active) {
                  return null; // Don't show tooltip when not hovering
                }

                // Find the data for the current hovered time (label)
                const data = fuelLevelData.find((item) => item.time === label);

                if (!data) {
                  return null;  // Return null if data is not found
                }

                return (
                  <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
                    <p><strong>Time:</strong> {data.time}</p>
                    <p><strong>Fuel Level:</strong> {data.engineFuelLevel}%</p>
                    <p><strong>Anomaly:</strong> {data.fuelLevelISAnomaly === 1 ? "Yes" : "No"}</p>
                  </div>
                );
              }}
            />
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
              dataKey="engineFuelLevel"  // Use the correct key for fuel level
              stroke="#5278d1"
              name="Fuel Level"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.fuelLevelISAnomaly)}  // Pass the anomaly flag to custom dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
