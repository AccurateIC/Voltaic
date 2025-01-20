// import { useEffect, useState } from "react";
// import {
//   CartesianGrid,
//   Line,
//   LineChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import renderCustomDot from "./renderCustomDot";

// export const BatteryChargeLineChart = ({
//   timeStamp,
//   batteryVolts,
//   chargeAltVolts,
//   batteryVoltsIsAnomaly,
//   chargeAltVoltsIsAnomaly,
// }) => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     if (batteryVolts !== undefined || chargeAltVolts !== undefined) {
//       setData((currentData) => {
//         if (currentData.length > 150) currentData.shift();

//         return [
//           ...currentData,
//           {
//             time: new Date(timeStamp).toLocaleTimeString(),
//             batteryVolts,
//             chargeAltVolts,
//             batteryVoltsIsAnomaly,
//             chargeAltVoltsIsAnomaly,
//           },
//         ];
//       });
//     }
//   }, [batteryVolts, chargeAltVolts, timeStamp]);

//   return (
//     <div className="h-[500px] w-full relative">
//       <h2 className="text-lg font-semibold p-4">Battery Charge Monitor</h2>
//       <div className="h-[calc(100%-3rem)]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={data}
//             margin={{ top: 10, right: 30, bottom: 30, left: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="time" />
//             <YAxis
//               label={{
//                 value: "Voltage (V)",
//                 angle: -90,
//                 position: "insideLeft",
//                 dy: 60,
//               }}
//               domain={["auto", "auto"]}
//             />
//             <Tooltip />

//             <Line
//               type="line"
//               isAnimationActive={false}
//               dataKey="batteryVolts"
//               stroke="#5278d1"
//               name="Battery Voltage"
//               strokeWidth={2}
//               dot={(props) =>
//                 renderCustomDot(props, props.payload.batteryVoltsIsAnomaly)
//               }
//             />

//             <Line
//               type="line"
//               isAnimationActive={false}
//               dataKey="chargeAltVolts"
//               stroke="#5dd12c"
//               name="Charge Alternator Voltage"
//               strokeWidth={2}
//               dot={(props) =>
//                 renderCustomDot(props, props.payload.chargeAltVoltsIsAnomaly)
//               }
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBatteryData } from "../../redux/graphSlice"; // Action to add battery data
import { selectBatteryData } from "../../redux/graphSlice"; // Selector to get battery data
import {
  addNotification,
  removeNotification,
} from "../../redux/notificationSlice"; // Notification actions
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import renderCustomDot from "./renderCustomDot"; // Custom dot rendering based on anomaly

export const BatteryChargeLineChart = ({
  timeStamp,
  batteryVolts,
  chargeAltVolts,
  batteryVoltsIsAnomaly,
  chargeAltVoltsIsAnomaly,
}) => {
  const dispatch = useDispatch();
  const batteryData = useSelector(selectBatteryData); // Get battery data from Redux

  const batteryVoltsNotificationRef = useRef(false);
  const chargeAltVoltsNotificationRef = useRef(false);

  useEffect(() => {
    // Store battery and alternator voltage data in Redux
    if (batteryVolts !== undefined || chargeAltVolts !== undefined) {
      dispatch(
        addBatteryData({
          time: new Date(timeStamp).toLocaleTimeString(),
          batteryVolts,
          chargeAltVolts,
          batteryVoltsIsAnomaly,
          chargeAltVoltsIsAnomaly,
        })
      );
    }

    // Handle anomaly notifications for battery volts
    if (batteryVoltsIsAnomaly && !batteryVoltsNotificationRef.current) {
      dispatch(
        addNotification({
          id: "batteryVolts",
          message: "Battery voltage anomaly detected!",
          type: "battery",
        })
      );
      batteryVoltsNotificationRef.current = true;
    } else if (!batteryVoltsIsAnomaly && batteryVoltsNotificationRef.current) {
      dispatch(removeNotification({ id: "batteryVolts", type: "battery" }));
      batteryVoltsNotificationRef.current = false;
    }

    // Handle anomaly notifications for charge alternator volts
    if (chargeAltVoltsIsAnomaly && !chargeAltVoltsNotificationRef.current) {
      dispatch(
        addNotification({
          id: "chargeAltVolts",
          message: "Charge alternator voltage anomaly detected!",
          type: "chargeAlt",
        })
      );
      chargeAltVoltsNotificationRef.current = true;
    } else if (
      !chargeAltVoltsIsAnomaly &&
      chargeAltVoltsNotificationRef.current
    ) {
      dispatch(removeNotification({ id: "chargeAltVolts", type: "chargeAlt" }));
      chargeAltVoltsNotificationRef.current = false;
    }
  }, [
    timeStamp,
    batteryVolts,
    chargeAltVolts,
    batteryVoltsIsAnomaly,
    chargeAltVoltsIsAnomaly,
    dispatch,
  ]);

  return (
    <div className="h-[500px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Battery Charge Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={batteryData}
            margin={{ top: 10, right: 30, bottom: 30, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
                dy: 60,
              }}
              domain={[0,15]}
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
              dot={(props) =>
                renderCustomDot(props, props.payload.batteryVoltsIsAnomaly)
              }
            />

            <Line
              type="line"
              isAnimationActive={false}
              dataKey="chargeAltVolts"
              stroke="#5dd12c"
              name="Charge Alternator Voltage"
              strokeWidth={2}
              dot={(props) =>
                renderCustomDot(props, props.payload.chargeAltVoltsIsAnomaly)
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
