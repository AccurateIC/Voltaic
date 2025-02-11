import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFuelLevelData } from "../../Redux/graphSlice.js";
import { selectFuelLevelData } from "../../Redux/graphSlice.js";
import { addNotification, removeNotification } from "../../Redux/notificationSlice.js"; // Import your notification actions
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineFuelLevelLineChart = ({ timeStamp, fuelLevel, fuelLevelISAnomaly }) => {
  const dispatch = useDispatch();
  const fuelLevelData = useSelector(selectFuelLevelData);

  const fuelLevelNotificationRef = useRef(false);

  useEffect(() => {
    if (fuelLevel !== -1) {
      dispatch(
        addFuelLevelData({
          time: new Date(timeStamp).toLocaleTimeString(),
          fuelLevel,
          fuelLevelISAnomaly,
        })
      );
    }

    if (fuelLevelISAnomaly && !fuelLevelNotificationRef.current) {
      dispatch(
        addNotification({
          message: "Fuel level anomaly detected!",
          type: "fuel",
        })
      );
      fuelLevelNotificationRef.current = true;
    } else if (!fuelLevelISAnomaly && fuelLevelNotificationRef.current) {
      dispatch(removeNotification({ id: "fuelLevelAnomaly", type: "fuel" }));
      fuelLevelNotificationRef.current = false;
    }
  }, [fuelLevel, timeStamp, fuelLevelISAnomaly, dispatch]);

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
              dot={(props) => renderCustomDot(props, props.payload.fuelLevelISAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
