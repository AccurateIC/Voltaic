import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const initialData = Array.from({ length: 100 }, (_, i) => ({
  time: i * 100,
  predicted: Math.max(10000 - i * 80, 0),
  rul: Math.max(10000 - i * 120, 0),
}));

const RUL = () => {
  const [xRange, setXRange] = useState([0, 10000]);

  const filteredData = initialData.filter((d) => d.time >= xRange[0] && d.time <= xRange[1]);

  return (
    <div className="w-full mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl md:text-3xl lg:text-xl font-bold text-center mb-4">Remaining Useful Life (RUL)</h2>

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-4 items-center">
        <label className="font-semibold text-base-content">Set X-Axis Range:</label>
        <input
          type="number"
          min="0"
          max="10000"
          value={xRange[0]}
          onChange={(e) => setXRange([Number(e.target.value), xRange[1]])}
          className="border p-1 w-20 text-center"
        />
        <span>-</span>
        <input
          type="number"
          min="0"
          max="10000"
          value={xRange[1]}
          onChange={(e) => setXRange([xRange[0], Number(e.target.value)])}
          className="border p-1 w-20 text-center"
        />
      </div>

      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[370px] 2xl:h-[800px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Hours", position: "insideBottom", dy: 10 }} />
            <YAxis
              label={{
                value: "Remaining Life (hrs)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Line type="monotone" dataKey="predicted" stroke="#0088FE" strokeWidth={3} dot={false} name="Predicted Graph" />
            <Line type="monotone" dataKey="rul" stroke="#FF0000" strokeWidth={3} dot={false} name="RUL" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RUL;
