import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addOilPressureData } from "../../Redux/graphSlice.js";
import { selectOilPressureData } from "../../Redux/graphSlice.js";
import { addNotification, removeNotification } from "../../Redux/notificationSlice.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const OilPressureLineChart = ({ timeStamp, oilPressure, oilPressureIsAnomaly }) => {
  const dispatch = useDispatch();
  const oilPressureData = useSelector(selectOilPressureData);

  const oilPressureNotificationRef = useRef(false);

  useEffect(() => {
    if (oilPressure !== 0) {
      dispatch(
        addOilPressureData({
          time: new Date(timeStamp).toLocaleTimeString(),
          oilPressure,
          oilPressureIsAnomaly,
        })
      );
    }

    if (oilPressureIsAnomaly && !oilPressureNotificationRef.current) {
      dispatch(
        addNotification({
          id: "oilPressure",
          message: "Oil pressure anomaly detected!",
          type: "oilPressure",
        })
      );
      oilPressureNotificationRef.current = true;
    } else if (!oilPressureIsAnomaly && oilPressureNotificationRef.current) {
      dispatch(removeNotification({ id: "oilPressure", type: "oilPressure" }));
      oilPressureNotificationRef.current = false;
    }
  }, [timeStamp, oilPressure, oilPressureIsAnomaly, dispatch]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Oil Pressure Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={oilPressureData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Pressure (Bar)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 5]}
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
              dataKey="oilPressure"
              stroke="#5278d1"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.oilPressureIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
