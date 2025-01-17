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

export const GeneratorCurrentLineChart = ({
  timeStamp,
  l1Current,
  l2Current,
  l3Current,
  l1CIsAnomaly,
  l2CIsAnomaly,
  l3CIsAnomaly,
}) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);

  const l1NotificationRef = useRef(false);
  const l2NotificationRef = useRef(false);
  const l3NotificationRef = useRef(false);

  useEffect(() => {
    if (l1Current !== 0 && l2Current !== 0 && l3Current !== 0) {
      setData((currentData) => {
        if (currentData.length > 150) currentData.shift();

        return [
          ...currentData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            L1: l1Current,
            L2: l2Current,
            L3: l3Current,
            l1CIsAnomaly,
            l2CIsAnomaly,
            l3CIsAnomaly,
          },
        ];
      });
    }

    if (l1CIsAnomaly && !l1NotificationRef.current) {
      dispatch(
        addNotification({
          id: "L1",
          message: "Current anomaly detected in L1 phase!",
          type: "current",
        })
      );
      l1NotificationRef.current = true;
    } else if (!l1CIsAnomaly && l1NotificationRef.current) {
      dispatch(removeNotification({ id: "L1", type: "current" }));
      l1NotificationRef.current = false;
    }

    if (l2CIsAnomaly && !l2NotificationRef.current) {
      dispatch(
        addNotification({
          id: "L2",
          message: "Current anomaly detected in L2 phase!",
          type: "current",
        })
      );
      l2NotificationRef.current = true;
    } else if (!l2CIsAnomaly && l2NotificationRef.current) { //isAnomaly--false, current--true
      dispatch(removeNotification({ id: "L2", type: "current" }));
      l2NotificationRef.current = false;
    }

    if (l3CIsAnomaly && !l3NotificationRef.current) {
      dispatch(
        addNotification({
          id: "L3",
          message: "Current anomaly detected in L3 phase!",
          type: "current",
        })
      );
      l3NotificationRef.current = true;
    } else if (!l3CIsAnomaly && l3NotificationRef.current) {
      dispatch(removeNotification({ id: "L3", type: "current" }));
      l3NotificationRef.current = false;
    }
  }, [
    timeStamp,
    l1Current,
    l2Current,
    l3Current,
    l1CIsAnomaly,
    l2CIsAnomaly,
    l3CIsAnomaly,
    dispatch,
  ]);

  return (
    <div className="h-[500px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Generator Current Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, bottom: 30, left: 20} }>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Current (A)",
                angle: -90,
                position: "insideLeft",
              }}
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
              dot={(props) => renderCustomDot(props, props.payload.l1CIsAnomaly)}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L2"
              stroke="#ede907"
              name="L2 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l2CIsAnomaly)}
            />
            <Line
              type="line"
              isAnimationActive={false}
              dataKey="L3"
              stroke="#5278d1"
              name="L3 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l3CIsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
