import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { healthIndexData } from "../components/healthIndexData";

const RUL = () => {
  useEffect(() => {
    console.log("healthIndex", healthIndexData);
  }, []);

  useEffect(() => {
    console.log("Transformed Health Index Data: ", healthIndexData);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start p-5 space-y-6 h-[calc(100vh-100px)]">
      {/* Graph container with large height */}
      <div className="w-full lg:w-[160vh] h-[65vh]">
        {" "}
        {/* Set height of the graph */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={healthIndexData}>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="Time_Hours" label={{ value: "Hours", position: "insideBottom", dy: 10 }} />
            <YAxis label={{ value: "Health Index (HI)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="Predicted_Health_Index"
              stroke="#0088FE"
              strokeWidth={3}
              dot={false}
              name="Predicted Graph"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cards with flex to consume available space */}
      <div className="flex flex-row justify-between w-full gap-2 flex-grow">
        <div className="card card-border bg-blue-100 w-full sm:w-1/2 md:w-1/2 lg:w-1/2 h-full">
          <div className="card-body flex items-center justify-center ">
            <h2 className="card-title text-amber-500 text-2xl">
              Health Index: <span className="loading loading-spinner loading-xs"></span>{" "}
            </h2>
          </div>
        </div>

        <div className="card card-border bg-blue-100 w-full sm:w-1/2 md:w-1/2 lg:w-1/2 h-full">
          <div className="card-body flex items-center justify-center h-full">
            <h2 className="card-title text-amber-500 text-2xl">
              Predictive Maintenance: <span className="loading loading-spinner loading-xs"></span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RUL;
