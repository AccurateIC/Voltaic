// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch } from "react-redux";
// import {
//   addNotification,
//   removeNotification,
// } from "../../redux/notificationSlice";
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

// export const OilPressureLineChart = ({
//   timeStamp,
//   oilPressure,
//   oilPressureIsAnomaly,
// }) => {
//   const dispatch = useDispatch();
//   const [data, setData] = useState([]);

//   const oilPressureNotificationRef = useRef(false);

//   useEffect(() => {
//     if (oilPressure !== 0) {
//       setData((prevData) => {
//         if (prevData.length > 48) prevData.shift();

//         return [
//           ...prevData,
//           {
//             time: new Date(timeStamp).toLocaleTimeString(),
//             oilPressure,
//             oilPressureIsAnomaly,
//           },
//         ];
//       });
//     }

//     if (oilPressureIsAnomaly && !oilPressureNotificationRef.current) {
//       dispatch(
//         addNotification({
//           id: "oilPressure",
//           message: "Fuel pressure anomaly detected!",
//           type: "fuel",
//         })
//       );
//       oilPressureNotificationRef.current = true;
//     } else if (!oilPressureIsAnomaly && oilPressureNotificationRef.current) {
//       dispatch(removeNotification({ id: "oilPressure", type: "fuel" }));
//       oilPressureNotificationRef.current = false;
//     }
//   }, [timeStamp, oilPressure, oilPressureIsAnomaly, dispatch]);

//   return (
//     <div className="h-[500px] w-full relative">
//       <h2 className="text-lg font-semibold p-4">Oil Pressure Monitor</h2>
//       <div className="h-[calc(100%-3rem)]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data}margin={{ top: 10, right: 30, bottom: 30, left: 20} }>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="time" />
//             <YAxis
//               label={{
//                 value: "Pressure (Bar)",
//                 angle: -90,
//                 position: "insideLeft",
//               }}domain={["auto", "auto"]}
//             />
//             <Tooltip />
//             {/* <Legend
//                          layout="horizontal"
//                          verticalAlign="top"
//                          align="center"
//                          iconType="voltage"
//                          wrapperStyle={{ paddingBottom: 15 }}
//                        /> */}
//             <Line
//               type="line"
//               isAnimationActive={false}
//               dataKey="oilPressure"
//               stroke="#5278d1"
//               // name="Oil Pressure"
//               strokeWidth={2}
//               dot={(props) => renderCustomDot(props, props.payload.oilPressureIsAnomaly)}
              
//             />
           
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addOilPressureData } from "../../redux/graphSlice"; // Import the action
import { selectOilPressureData } from "../../redux/graphSlice"; // Selector to access the data
import { addNotification, removeNotification } from "../../redux/notificationSlice"; // Notification actions
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot"; // Custom dot rendering

export const OilPressureLineChart = ({ timeStamp, oilPressure, oilPressureIsAnomaly }) => {
  const dispatch = useDispatch();
  const oilPressureData = useSelector(selectOilPressureData); // Get oil pressure data from Redux store

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
    <div className="h-[500px] w-full relative">
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
              domain={["auto", "auto"]}
            />
            <Tooltip />
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
