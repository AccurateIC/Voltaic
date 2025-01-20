// import React, { useState, useEffect } from "react";
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

// export const EngineFuelLevelLineChart = ({
//   timeStamp,
//   fuelLevel,
//   fuelLevelISAnomaly,
// }) => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     if (fuelLevel !== -1) {
//       setData((currentData) => {
//         if (currentData.length > 48) currentData.shift();

//         return [
//           ...currentData,
//           {
//             time: new Date(timeStamp).toLocaleTimeString(),
//             fuelLevel: fuelLevel,
//             fuelLevelISAnomaly,
//           },
//         ];
//       });
//     }
//   }, [fuelLevel, timeStamp]);
//   return (
//     <div className="h-[500px] w-full ">
//       <h2 className="text-lg font-semibold p-4">Engine Fuel Level Monitor</h2>
//       <div className="h-[calc(100%-3rem)]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={data}
//             margin={{ top: 15, right: 30, bottom: 30, left: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               dataKey="time"
//               label={{ value: "Time", position: "bottom", offset: 0 }}
//             />
//             <YAxis
//               label={{
//                 value: "Fuel Level (%)",
//                 angle: -90,
//                 position: "insideLeft",
//               }}
//               domain={[0, "auto"]}
//             />
//             <Tooltip />
//             {/* <Legend
//                           layout="horizontal"
//                           verticalAlign="top"
//                           align="center"
//                           iconType="voltage"
//                           wrapperStyle={{ paddingBottom: 15 }}
//                         /> */}
//             <Line
//               type="line"
//               isAnimationActive={false}
//               dataKey="fuelLevel"
//               stroke="#5278d1"
//               name="Fuel Level"
//               strokeWidth={2}
//               dot={(props) => renderCustomDot(props, props.payload.fuelLevelISAnomaly)}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };


import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFuelLevelData } from "../../Redux/graphSlice"; // Import the action
import { selectFuelLevelData } from "../../Redux/graphSlice"; // Selector to access state
import { LineChart, Line, XAxis, YAxis, CartesianGrid,Legend, Tooltip, ResponsiveContainer } from "recharts";
import renderCustomDot from "./renderCustomDot"; 

export const EngineFuelLevelLineChart = ({ timeStamp, fuelLevel, fuelLevelISAnomaly }) => {
  const dispatch = useDispatch();
  const fuelLevelData = useSelector(selectFuelLevelData); // Get the graph data from Redux

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
  }, [fuelLevel, timeStamp, fuelLevelISAnomaly, dispatch]);

  return (
    <div className="h-[500px] w-full ">
      <h2 className="text-lg font-semibold p-4">Engine Fuel Level Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fuelLevelData} margin={{ top: 15, right: 30, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} />
            <YAxis label={{ value: "Fuel Level (%)", angle: -90, position: "insideLeft" }} domain={[0,60]} />
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
