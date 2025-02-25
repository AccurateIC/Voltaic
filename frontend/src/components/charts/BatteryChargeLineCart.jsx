/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const BatteryChargeLineChart = ({ batteryVolts, chargeAltVolts }) => {
  // Local state for storing battery data
  const [batteryData, setBatteryData] = useState([]);

  useEffect(() => {
    // Check if both arrays are not empty
    if (
      Array.isArray(batteryVolts) &&
      batteryVolts.length > 0 &&
      Array.isArray(chargeAltVolts) &&
      chargeAltVolts.length > 0
    ) {
      const newData = batteryVolts.map((batteryItem) => {
        const chargeAltItem = chargeAltVolts.find((item) => item.timestamp === batteryItem.timestamp);
        const time = new Date(batteryItem.timestamp);
        return {
          time: time.toLocaleTimeString(),
          batteryVolts: batteryItem.propertyValue,
          chargeAltVolts: chargeAltItem ? chargeAltItem.propertyValue : null,
          batteryVoltsIsAnomaly: batteryItem.isAnomaly,
          chargeAltVoltsIsAnomaly: chargeAltItem ? chargeAltItem.isAnomaly : null,
        };
      });

      setBatteryData(newData);
    }
  }, [batteryVolts, chargeAltVolts]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Battery Charge Monitor</h2>

      {/* 
      <div className="absolute top-1 right-4 text-xl font-semibold p-4">
         <span>Total Current: </span>
         <span
           className="font-bold text-lg text-red-600"
           style={{
             padding: "5px",
             borderRadius: "5px",
           }}
         >
           {l1l2l3Current} Amp
         </span>
       </div> */}

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
