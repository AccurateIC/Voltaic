// import React, { useState, useEffect, useRef } from "react";
// import { CiBellOn } from "react-icons/ci";
// import renderCustomDot from "./renderCustomDot";
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

// export const GeneratorCurrentLineChart = ({
//   timeStamp,
//   l1Current,
//   l2Current,
//   l3Current,
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
//     if (l1Current !== 0 && l2Current !== 0 && l3Current !== 0) {
//       setData((currentData) => {
//         if (currentData.length > 48) currentData.shift();

//         return [
//           ...currentData,
//           {
//             time: new Date(timeStamp).toLocaleTimeString(),
//             L1: l1Current,
//             L2: l2Current,
//             L3: l3Current,
//             l1IsAnomaly,
//             l2IsAnomaly,
//             l3IsAnomaly,
//           },
//         ];
//       });
//     }

//     if (l1IsAnomaly && !l1NotificationRef.current) {
//       setNotifications((prevNotifications) => [
//         ...prevNotifications,
//         { id: "L1", message: "Anomaly detected in L1 phase!" },
//       ]);
//       l1NotificationRef.current = true;
//     }

//     if (!l1IsAnomaly && l1NotificationRef.current) {
//       setNotifications((prevNotifications) =>
//         prevNotifications.filter((notification) => notification.id !== "L1")
//       );
//       l1NotificationRef.current = false;
//     }

//     if (l2IsAnomaly && !l2NotificationRef.current) {
//       setNotifications((prevNotifications) => [
//         ...prevNotifications,
//         { id: "L2", message: "Anomaly detected in L2 phase!" },
//       ]);
//       l2NotificationRef.current = true;
//     }

//     if (!l2IsAnomaly && l2NotificationRef.current) {
//       setNotifications((prevNotifications) =>
//         prevNotifications.filter((notification) => notification.id !== "L2")
//       );
//       l2NotificationRef.current = false;
//     }

//     if (l3IsAnomaly && !l3NotificationRef.current) {
//       setNotifications((prevNotifications) => [
//         ...prevNotifications,
//         { id: "L3", message: "Anomaly detected in L3 phase!" },
//       ]);
//       l3NotificationRef.current = true;
//     }

//     if (!l3IsAnomaly && l3NotificationRef.current) {
//       setNotifications((prevNotifications) =>
//         prevNotifications.filter((notification) => notification.id !== "L3")
//       );
//       l3NotificationRef.current = false;
//     }
//   }, [
//     l1Current,
//     l2Current,
//     l3Current,
//     timeStamp,
//     l1IsAnomaly,
//     l2IsAnomaly,
//     l3IsAnomaly,
//   ]);

//   const toggleNotifications = () => {
//     setShowNotifications(!showNotifications);
//   };
 

//   return (
//     <div className="h-[400px] w-full relative">
//       <h2 className="text-lg font-semibold p-4">Generator Current Monitor</h2>
//       <div className="h-[calc(100%-3rem)]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={data}
//             margin={{
//               top: 5,
//               right: 30,
//               left: 20,
//               bottom: 20,
//             }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               dataKey="time"
//               label={{ value: "Time", position: "bottom", offset: 0 }}
//             />
//             <YAxis
//               label={{
//                 value: "Current (V)",
//                 angle: -90,
//                 position: "insideLeft",
//               }}
//               domain={["auto", "auto"]}
//             />
//             <Tooltip />
//             <Legend />

//             <Line
//               type="line"
//               dataKey="L1"
//               stroke="#CAA98F"
//               name="L1 Phase"
//               strokeWidth={2}
//               dot={(props) => renderCustomDot(props, l1IsAnomaly)} 
//             />
//             <Line
//               type="line"
//               dataKey="L2"
//               stroke="#B3CC99"
//               name="L2 Phase"
//               strokeWidth={2}
//               dot={(props) => renderCustomDot(props, l2IsAnomaly)} 
//             />
//             <Line
//               type="line"
//               dataKey="L3"
//               stroke="#99B3CC"
//               name="L3 Phase"
//               strokeWidth={2}
//               dot={(props) => renderCustomDot(props, l3IsAnomaly)} 
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };


import React, { useState, useEffect, useRef } from "react";
import { CiBellOn } from "react-icons/ci";
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
  l1IsAnomaly,
  l2IsAnomaly,
  l3IsAnomaly,
}) => {
  const [data, setData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const l1NotificationRef = useRef(false);
  const l2NotificationRef = useRef(false);
  const l3NotificationRef = useRef(false);

  // Effect to handle current data updates
  useEffect(() => {
    if (l1Current !== 0 && l2Current !== 0 && l3Current !== 0) {
      setData((currentData) => {
        // Keep the data length within the last 48 records
        if (currentData.length > 48) currentData.shift();

        return [
          ...currentData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            L1: l1Current,
            L2: l2Current,
            L3: l3Current,
            l1IsAnomaly,
            l2IsAnomaly,
            l3IsAnomaly,
          },
        ];
      });
    }

    // Check anomalies for each phase and add notifications if needed
    if (l1IsAnomaly && !l1NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L1", message: "Anomaly detected in L1 phase!" },
      ]);
      l1NotificationRef.current = true;
    }

    if (!l1IsAnomaly && l1NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L1")
      );
      console.log("Current L1 true" );
      l1NotificationRef.current = false;
    }

    if (l2IsAnomaly && !l2NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L2", message: "Anomaly detected in L2 phase!" },
      ]);
      console.log("Current L2 true" );
      l2NotificationRef.current = true;
    }

    if (!l2IsAnomaly && l2NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L2")
      );
      l2NotificationRef.current = false;
    }

    if (l3IsAnomaly && !l3NotificationRef.current) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { id: "L3", message: "Anomaly detected in L3 phase!" },
      ]);
      console.log("Current L3 true" );
      l3NotificationRef.current = true;
    }

    if (!l3IsAnomaly && l3NotificationRef.current) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== "L3")
      );
      l3NotificationRef.current = false;
    }
  }, [
    l1Current,
    l2Current,
    l3Current,
    timeStamp,
    l1IsAnomaly,
    l2IsAnomaly,
    l3IsAnomaly,
  ]);

  // Function to toggle notifications visibility
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Generator Current Monitor</h2>
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
                value: "Current (A)",
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
              dot={(props) => renderCustomDot(props, l1IsAnomaly)}
            />
            <Line
              type="line"
              dataKey="L2"
              stroke="#B3CC99"
              name="L2 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, l2IsAnomaly)}
            />
            <Line
              type="line"
              dataKey="L3"
              stroke="#99B3CC"
              name="L3 Phase"
              strokeWidth={2}
              dot={(props) => renderCustomDot(props, l3IsAnomaly)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
