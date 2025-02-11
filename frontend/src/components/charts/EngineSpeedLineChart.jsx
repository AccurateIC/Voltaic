// // // import React, { useEffect } from "react";
// // // import { useDispatch, useSelector } from "react-redux";
// // // import { addEngineSpeedData } from "../../Redux/graphSlice";
// // // import { selectEngineSpeedData } from "../../Redux/graphSlice";
// // // import {
// // //   LineChart,
// // //   Line,
// // //   XAxis,
// // //   YAxis,
// // //   CartesianGrid,
// // //   Legend,
// // //   Tooltip,
// // //   ResponsiveContainer,
// // // } from "recharts";
// // // import renderCustomDot from "./renderCustomDot";

// // // export const EngineSpeedLineChart = ({
// // //   timeStamp,
// // //   value,
// // //   engSpeedIsAnomaly,
// // // }) => {
// // //   const dispatch = useDispatch();
// // //   const engineSpeedData = useSelector(selectEngineSpeedData);

// // //   useEffect(() => {
// // //     if (value !== undefined) {
// // //       dispatch(
// // //         addEngineSpeedData({
// // //           time: new Date(timeStamp).toLocaleTimeString(),
// // //           engineSpeed: value,
// // //           engSpeedIsAnomaly,
// // //         })
// // //       );
// // //     }
// // //   }, [value, timeStamp, engSpeedIsAnomaly, dispatch]);

// // //   return (
// // //     <div className="h-[500px] w-full relative">
// // //       <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>
// // //       <div className="h-[calc(100%-3rem)]">
// // //         <ResponsiveContainer width="100%" height="100%">
// // //           <LineChart
// // //             data={engineSpeedData}
// // //             margin={{ top: 10, right: 30, bottom: 30, left: 20 }}
// // //           >
// // //             <CartesianGrid strokeDasharray="3 3" />
// // //             <XAxis dataKey="time" />
// // //             <YAxis
// // //               label={{
// // //                 value: "Engine Speed (RPM)",
// // //                 angle: -90,
// // //                 position: "insideLeft",
// // //                 dy: 60,
// // //               }}
// // //               domain={[0, 2000]}
// // //             />

// // //             <Tooltip />
// // //             <Legend
// // //               layout="horizontal"
// // //               verticalAlign="top"
// // //               align="center"
// // //               iconType="engine"
// // //               wrapperStyle={{ paddingBottom: 15 }}
// // //             />
// // //             <Line
// // //               type="line"
// // //               isAnimationActive={false}
// // //               dataKey="engineSpeed"
// // //               stroke="#5278d1"
// // //               name="Engine Speed"
// // //               strokeWidth={2}
// // //               dot={(props) =>
// // //                 renderCustomDot(props, props.payload.engSpeedIsAnomaly)
// // //               }
// // //             />
// // //           </LineChart>
// // //         </ResponsiveContainer>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // import React, { useEffect, useRef } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { addEngineSpeedData } from "../../Redux/graphSlice";
// // import { selectEngineSpeedData } from "../../Redux/graphSlice";
// // import { addNotification, removeNotification } from "../../redux/notificationSlice";  // Import notification actions
// // import {
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Legend,
// //   Tooltip,
// //   ResponsiveContainer,
// // } from "recharts";
// // import renderCustomDot from "./renderCustomDot"; // Import the custom dot render function

// // export const EngineSpeedLineChart = ({
// //   timeStamp,
// //   value,
// //   engSpeedIsAnomaly,
// // }) => {
// //   const dispatch = useDispatch();
// //   const engineSpeedData = useSelector(selectEngineSpeedData);

// //   // Reference to track notification state
// //   const engineSpeedNotificationRef = useRef(false);

// //   useEffect(() => {

// //     if (value !== undefined) {
// //       dispatch(
// //         addEngineSpeedData({
// //           time: new Date(timeStamp).toLocaleTimeString(),
// //           engineSpeed: value,
// //           engSpeedIsAnomaly,
// //         })
// //       );
// //     }

// //     if (engSpeedIsAnomaly && !engineSpeedNotificationRef.current) {
// //       dispatch(
// //         addNotification({
// //           id: "engineSpeedAnomaly",
// //           message: "Engine speed anomaly detected!",
// //           type: "engineSpeed",
// //         })
// //       );
// //       engineSpeedNotificationRef.current = true;
// //     } else if (!engSpeedIsAnomaly && engineSpeedNotificationRef.current) {
// //       dispatch(removeNotification({ id: "engineSpeedAnomaly", type: "engineSpeed" }));
// //       engineSpeedNotificationRef.current = false;
// //     }
// //   }, [value, timeStamp, engSpeedIsAnomaly, dispatch]);

// //   return (
// //     <div className="h-[500px] w-full relative">
// //       <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>
// //       <div className="h-[calc(100%-3rem)]">
// //         <ResponsiveContainer width="100%" height="100%">
// //           <LineChart
// //             data={engineSpeedData}
// //             margin={{ top: 10, right: 30, bottom: 30, left: 20 }}
// //           >
// //             <CartesianGrid strokeDasharray="3 3" />
// //             <XAxis dataKey="time" />
// //             <YAxis
// //               label={{
// //                 value: "Engine Speed (RPM)",
// //                 angle: -90,
// //                 position: "insideLeft",
// //                 dy: 60,
// //               }}
// //               domain={[0, 2000]}
// //             />
// //             <Tooltip />
// //             <Legend
// //               layout="horizontal"
// //               verticalAlign="top"
// //               align="center"
// //               iconType="engine"
// //               wrapperStyle={{ paddingBottom: 15 }}
// //             />
// //             <Line
// //               type="line"
// //               isAnimationActive={false}
// //               dataKey="engineSpeed"
// //               stroke="#5278d1"
// //               name="Engine Speed"
// //               strokeWidth={2}
// //               dot={(props) => renderCustomDot(props, props.payload.engSpeedIsAnomaly)} // Pass engSpeedIsAnomaly here
// //             />
// //           </LineChart>
// //         </ResponsiveContainer>
// //       </div>
// //     </div>
// //   );
// // };

// import React, { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { addEngineSpeedData } from "../../Redux/graphSlice";
// import { selectEngineSpeedData } from "../../Redux/graphSlice";
// import { addNotification, removeNotification } from "../../redux/notificationSlice";  // Import notification actions
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Legend,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import renderCustomDot from "./renderCustomDot"; // Import the custom dot render function

// export const EngineSpeedLineChart = ({
//   timeStamp,
//   value,
//   engSpeedIsAnomaly,
// }) => {
//   const dispatch = useDispatch();
//   const engineSpeedData = useSelector(selectEngineSpeedData);

//   // Reference to track notification state
//   const engineSpeedNotificationRef = useRef(false);

//   useEffect(() => {
//     // Dispatch engine speed data to Redux store
//     if (value !== undefined) {
//       dispatch(
//         addEngineSpeedData({
//           time: new Date(timeStamp).toLocaleTimeString(),
//           engineSpeed: value,
//           engSpeedIsAnomaly, // Make sure this flag is part of the data
//         })
//       );
//     }

//     // Handle notification if anomaly is detected
//     if (engSpeedIsAnomaly && !engineSpeedNotificationRef.current) {
//       dispatch(
//         addNotification({
//           id: "engineSpeedAnomaly",  // Unique id for the notification
//           message: "Engine speed anomaly detected!",  // Custom message for engine speed
//           type: "engineSpeed",  // Optional, used to categorize the notification
//         })
//       );
//       engineSpeedNotificationRef.current = true;
//     } else if (!engSpeedIsAnomaly && engineSpeedNotificationRef.current) {
//       dispatch(removeNotification({ id: "engineSpeedAnomaly", type: "engineSpeed" }));
//       engineSpeedNotificationRef.current = false;
//     }
//   }, [value, timeStamp, engSpeedIsAnomaly, dispatch]);

//   return (
//     <div className="h-[400px] w-full relative">
//       <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>
//       <div className="h-[calc(100%-3rem)]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={engineSpeedData}
//             margin={{ top: 10, right: 30, bottom: 30, left: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="time" />
//             <YAxis
//               label={{
//                 value: "Engine Speed (RPM)",
//                 angle: -90,
//                 position: "insideLeft",
//                 dy: 60,
//               }}
//               domain={[0, 2000]}
//             />
//             <Tooltip />
//             <Legend
//               layout="horizontal"
//               verticalAlign="top"
//               align="center"
//               iconType="engine"
//               wrapperStyle={{ paddingBottom: 15 }}
//             />
//             <Line
//               type="line"
//               isAnimationActive={false}
//               dataKey="engineSpeed"
//               stroke="#5278d1"
//               name="Engine Speed"
//               strokeWidth={2}
//               dot={(props) =>
//                 renderCustomDot(props, props.payload.engSpeedIsAnomaly) // Pass engSpeedIsAnomaly here
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
import { addEngineSpeedData } from "../../Redux/graphSlice.js";
import { selectEngineSpeedData } from "../../Redux/graphSlice.js";
import { addNotification, removeNotification } from "../../Redux/notificationSlice.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot";

export const EngineSpeedLineChart = ({ timeStamp, value, engSpeedIsAnomaly }) => {
  const dispatch = useDispatch();
  const engineSpeedData = useSelector(selectEngineSpeedData);
  const engineSpeedNotificationRef = useRef(false);

  useEffect(() => {
    console.log("useEffect triggered", { value, timeStamp, engSpeedIsAnomaly });

    if (value !== undefined) {
      dispatch(
        addEngineSpeedData({
          time: new Date(timeStamp).toLocaleTimeString(),
          engineSpeed: value,
          engSpeedIsAnomaly,
        })
      );
    }

    if (engSpeedIsAnomaly && !engineSpeedNotificationRef.current) {
      console.log("Anomaly detected, dispatching notification");
      dispatch(
        addNotification({
          id: "engineSpeedAnomaly",
          message: "Engine speed anomaly detected!",
          type: "engineSpeed",
        })
      );
      engineSpeedNotificationRef.current = true;
    } else if (!engSpeedIsAnomaly && engineSpeedNotificationRef.current) {
      console.log("Anomaly cleared, removing notification");
      dispatch(removeNotification({ id: "engineSpeedAnomaly", type: "engineSpeed" }));
      engineSpeedNotificationRef.current = false;
    }
  }, [value, timeStamp, engSpeedIsAnomaly, dispatch]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Engine Speed Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={engineSpeedData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: "Engine Speed (RPM)", angle: -90, position: "insideLeft", dy: 60 }} domain={[0, 2000]} />
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
              dataKey="engineSpeed"
              stroke="#5278d1"
              name="Engine Speed"
              strokeWidth={2}
              dot={(props) => {
                console.log("Rendering dot", props);
                return renderCustomDot(props, props.payload.engSpeedIsAnomaly);
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
