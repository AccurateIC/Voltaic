// /* eslint-disable react/prop-types */
// import  { useState, useEffect, useRef } from "react";
// import { CiBellOn } from "react-icons/ci"; // Bell icon from react-icons
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import renderCustomDot from "./renderCustomDot";
// export const GeneratorVoltageLineChart = ({
//   timeStamp,
//   l1Voltage,
//   l2Voltage,
//   l3Voltage,
//   l1IsAnomaly,
//   l2IsAnomaly,
//   l3IsAnomaly,
// }) => {
//   const [data, setData] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);

//   const l1NotificationRef = useRef(false);
//   const l2NotificationRef = useRef(false);
//   const l3NotificationRef = useRef(false);

//   useEffect(() => {
//     if (l1Voltage !== 0 && l2Voltage !== 0 && l3Voltage !== 0) {
//       setData((currentData) => {
//         if (currentData.length > 48) currentData.shift();

//         return [
//           ...currentData,
//           {
//             time: new Date(timeStamp).toLocaleTimeString(),
//             L1: l1Voltage,
//             L2: l2Voltage,
//             L3: l3Voltage,
//              l1IsAnomaly,
//             l2IsAnomaly,
//             l3IsAnomaly,
//           },
//         ];
//       });
//     }
//   }, [timeStamp, l1Voltage, l2Voltage, l3Voltage]);

//   useEffect(() => {
//     const updateNotifications = (phase, isAnomaly, ref) => {

//       console.log(isAnomaly);
//       if (isAnomaly && !ref.current) {
//         setNotifications((prev) => [
//           ...prev,
//           { id: phase, message: `Anomaly detected in ${phase} phase!` },
//         ]);
//         ref.current = true;
//       }
//       console.log(isAnomaly);
//       if (!isAnomaly && ref.current) {
//         setNotifications((prev) =>
//           prev.filter((notification) => notification.id !== phase)
//         );
//         ref.current = false;
//       }
//     };

//     updateNotifications("L1", l1IsAnomaly, l1NotificationRef);
//     updateNotifications("L2", l2IsAnomaly, l2NotificationRef);
//     updateNotifications("L3", l3IsAnomaly, l3NotificationRef);
//   }, [l1IsAnomaly, l2IsAnomaly, l3IsAnomaly]);

//   const toggleNotifications = () => {
//     setShowNotifications(!showNotifications);
//   };

// return (
//   <div className="h-[400px] w-full relative">
//     <h2 className="text-lg font-semibold p-4">Generator Voltage Monitor</h2>
//     <div className="h-[calc(100%-3rem)]">
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart
//           data={data}
//           margin={{
//             top: 5,
//             right: 30,
//             left: 20,
//             bottom: 20,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             dataKey="time"
//             label={{ value: "Time", position: "bottom", offset: 0 }}
//           />
//           <YAxis
//             label={{
//               value: "Voltage (V)",
//               angle: -90,
//               position: "insideLeft",
//             }}
//             domain={["auto", "auto"]}
//           />
//           <Tooltip />
//           <Legend />
//           <Line
//             type="line"
//             dataKey="L1"
//             stroke="#CAA98F"
//             name="L1 Phase"
//             strokeWidth={2}
//             dot={(props) => renderCustomDot(props, props.payload.l1IsAnomaly)}
//           />
//           <Line
//             type="line"
//             dataKey="L2"
//             stroke="#B3CC99"
//             name="L2 Phase"
//             strokeWidth={2}
//             dot={(props) => renderCustomDot(props, props.payload.l1IsAnomaly)}
//           />
//           <Line
//             type="l"
//             dataKey="L3"
//             stroke="#99B3CC" // Very light steel blue
//             name="L3 Phase"
//             strokeWidth={2}
//             dot={(props) => renderCustomDot(props, props.payload.l1IsAnomaly)}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Notification Bell Icon */}
//     <div
//       className="relative cursor-pointer"
//       onClick={toggleNotifications}
//       style={{ position: "absolute", top: "20px", right: "20px" }}
//     >
//       <CiBellOn size={30} color="black" />
//       {notifications.length > 0 && (
//         <div
//           className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs"
//           style={{ fontSize: "12px" }}
//         >
//           {notifications.length}
//         </div>
//       )}
//     </div>

//     {/* Notification Dropdown */}
//     {showNotifications && notifications.length > 0 && (
//       <div
//         className="absolute top-12 right-0 bg-white border border-gray-300 shadow-md w-60 max-h-60 overflow-y-auto"
//         style={{ zIndex: 10 }}
//       >
//         <ul className="p-2">
//           {notifications.map((notification, index) => (
//             <li key={index} className="p-2 border-b">
//               {notification.message}
//             </li>
//           ))}
//         </ul>
//       </div>
//     )}
//   </div>
// );
// };

// src/components/charts/GeneratorVoltageLineChart.jsx
import { useState, useEffect } from "react";
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
  const dispatch = useDispatch(); // Get the dispatch function from Redux
  const [data, setData] = useState([]);

  useEffect(() => {
    // Add data for the chart
    if (l1Voltage !== 0 && l2Voltage !== 0 && l3Voltage !== 0) {
      setData((voltageData) => {
        if (voltageData.length > 48) voltageData.shift();

        return [
          ...voltageData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            L1: l1Voltage,
            L2: l2Voltage,
            L3: l3Voltage,
          },
        ];
      });
    }

    if (l1IsAnomaly) {
      dispatch(
        addNotification({ id: "L1", message: "Anomaly detected in L1 phase!" })
      );
    } else {
      dispatch(removeNotification("L1"));
    }

    if (l2IsAnomaly) {
      dispatch(
        addNotification({ id: "L2", message: "Anomaly detected in L2 phase!" })
      );
    } else {
      dispatch(removeNotification("L2"));
    }

    if (l3IsAnomaly) {
      dispatch(
        addNotification({ id: "L3", message: "Anomaly detected in L3 phase!" })
      );
    } else {
      dispatch(removeNotification("L3"));
    }
  }, [
    timeStamp,
    l1Voltage,
    l2Voltage,
    l3Voltage,
    l1IsAnomaly,
    l2IsAnomaly,
    l3IsAnomaly,
    dispatch,
  ]);

  return (
    <div className="h-[400px] w-full relative">
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
              domain={["auto", "auto"]}
            />
            <Tooltip />
            <Legend />
            <Line
              type="line"
              dataKey="L1"
              stroke="#CAA98F"
              name="L1 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l1IsAnomaly)}
            />
            <Line
              type="line"
              dataKey="L2"
              stroke="#B3CC99"
              name="L2 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, props.payload.l2IsAnomaly)}
            />
            <Line
              type="l"
              dataKey="L3"
              stroke="#99B3CC"
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
