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

export const GeneratorVoltageLineChart = ({
  timeStamp,
  l1Voltage,
  l2Voltage,
  l3Voltage,
  l1IsAnomaly,
  l2IsAnomaly,
  l3IsAnomaly,
}) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);

  const l1NotificationRef = useRef(false);
  const l2NotificationRef = useRef(false);
  const l3NotificationRef = useRef(false);

  // console.log("first.............")

  useEffect(() => {
    
    if (l1Voltage !== 0 && l2Voltage !== 0 && l3Voltage !== 0) {
      setData((voltageData) => {
         
        if (voltageData.length > 150) voltageData.shift();

        return [
          ...voltageData,
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
      dispatch(
        addNotification({
          id: "L1",
          message: "Voltage anomaly detected in L1 phase!",
          type: "voltage",
        })
      );
      l1NotificationRef.current = true;
    } else if (!l1IsAnomaly && l1NotificationRef.current) {
      dispatch(removeNotification({ id: "L1", type: "voltage" }));
      l1NotificationRef.current = false;
    }

    if (l2IsAnomaly && !l2NotificationRef.current) {
      dispatch(
        addNotification({
          id: "L2",
          message: "Voltage anomaly detected in L2 phase!",
          type: "voltage",
        })
      );
      l2NotificationRef.current = true;
    } else if (!l2IsAnomaly && l2NotificationRef.current) {
      dispatch(removeNotification({ id: "L2", type: "voltage" }));
      l2NotificationRef.current = false;
    }

    if (l3IsAnomaly && !l3NotificationRef.current) {
      dispatch(
        addNotification({
          id: "L3",
          message: "Voltage anomaly detected in L3 phase!",
          type: "voltage",
        })
      );
      l3NotificationRef.current = true;
    } else if (!l3IsAnomaly && l3NotificationRef.current) {
      dispatch(removeNotification({ id: "L3", type: "voltage" }));
      l3NotificationRef.current = false;
    }
  },
  [
    timeStamp,
    l1Voltage,
    l2Voltage,
    l3Voltage,
    l1IsAnomaly,
    l2IsAnomaly,
    l3IsAnomaly,
    dispatch,
  ]
);

  return (
    <div className="h-[500px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Generator Voltage Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 1, right: 30, bottom: 30, left: 20} }
          >
            <CartesianGrid strokeDasharray="1 1" />
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
              domain={["auto", "auto"]}
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
    </div>
  );
};
