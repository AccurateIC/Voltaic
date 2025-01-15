import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  addNotification,
  removeNotification,
} from "../../redux/notificationSlice";
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

export const OilPressureLineChart = ({
  timeStamp,
  oilPressure,
  oilPressureIsAnomaly,
}) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);

  const oilPressureNotificationRef = useRef(false);

  useEffect(() => {
    if (oilPressure !== 0) {
      setData((prevData) => {
        if (prevData.length > 48) prevData.shift();

        return [
          ...prevData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            oilPressure,
            oilPressureIsAnomaly,
          },
        ];
      });
    }

    if (oilPressureIsAnomaly && !oilPressureNotificationRef.current) {
      dispatch(
        addNotification({
          id: "oilPressure",
          message: "Fuel pressure anomaly detected!",
          type: "fuel",
        })
      );
      oilPressureNotificationRef.current = true;
    } else if (!oilPressureIsAnomaly && oilPressureNotificationRef.current) {
      dispatch(removeNotification({ id: "oilPressure", type: "fuel" }));
      oilPressureNotificationRef.current = false;
    }
  }, [timeStamp, oilPressure, oilPressureIsAnomaly, dispatch]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Oil Pressure Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Pressure (Bar)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="oilPressure"
              stroke="#CAA98F"
              name="Oil Pressure"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, oilPressureIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
