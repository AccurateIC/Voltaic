import { useEffect, useState } from "react";
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";
import { filteredHealthIndexData } from "../components/filteredHealthIndexData";
import { rulInputData } from "../components/rulData";

const RulChart = ({ apiPoint }) => {
  const data = [...filteredHealthIndexData];
  const singlePointData = apiPoint
    ? {
        Time_Hours: apiPoint.Remaining_Useful_Life,
        Predicted_Health_Index: apiPoint.Predicted_Health_Index,
        Show_Red: true,
      }
    : {};

  data.push(singlePointData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}>
        <XAxis
          type="number"
          domain={[0, 10000]}
          dataKey="Time_Hours"
          label={{ value: "Hours", position: "insideBottom", dy: 10 }}
        />
        <YAxis
          type="number"
          dataKey="Predicted_Health_Index"
          domain={[0, 1]}
          label={{ value: "Health Index (HI)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Line type="monotone" dataKey="Predicted_Health_Index" fill="#8884d8" />
        <Scatter name="">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.Show_Red ? "#ff0000" : "#8884d8"} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

const RUL = () => {
  const [count, setCount] = useState(0);
  const [apiPoint, setApiPoint] = useState({ Remaining_Useful_Life: null, Predicted_Health_Index: null });

  const fetchRulData = async () => {
    try {
      const entry = rulInputData[count];
      const response = await fetch(`http://192.168.1.107:5000/predict`, {
        method: "POST",
        body: JSON.stringify(entry),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setApiPoint(data);
      setCount((prevCount) => (prevCount + 1) % rulInputData.length);
    } catch (error) {
      console.error("Error fetching RUL data:", error);
    }
  };

  useEffect(() => {
    fetchRulData();
  }, []);

  useEffect(() => {
    const entry = rulInputData[count];
    console.log(entry.Predicted_Health_Index);
  }, [count]);

  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="flex justify-between mb-2">
        <div className="text-base-200 text-3xl">Remaining Useful Life</div>
        <div className="flex gap-2">
          <button onClick={fetchRulData} className="btn btn-primary">
            Calculate RUL
          </button>
        </div>
      </div>
      <div className="flex flex-col h-5/5">
        <RulChart apiPoint={apiPoint} />
      </div>
      <div className="flex flex-col flex-1/5 sm:flex-row gap-4">
        <div className="stats shadow flex-1 items-center justify-center bg-base-200">
          <div className="stat m-2">
            <div className="stat-title text-4xl sm:text-2xl">Remaining Useful Life</div>
            <div className="stat-value text-base-content">{Math.round(apiPoint.Remaining_Useful_Life)} hours</div>
          </div>
        </div>
        {/* <div className="stats shadow flex-1 items-center justify-center bg-base-200">
          <div className="stat m-2">
            <div className="stat-title text-4xl sm:text-2xl">Predicted Health Index</div>
            <div className="stat-value text-base-content">{Math.round(apiPoint.Predicted_Health_Index * 100) / 100}</div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default RUL;
