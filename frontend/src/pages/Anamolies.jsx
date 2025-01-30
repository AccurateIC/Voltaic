import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
} from "recharts";

const pieData = [
  { name: "Month", value: 60, color: "#B1D5BD" },
  { name: "Week", value: 30, color: "#94EAFD" },
  { name: "Day", value: 10, color: "#FFF627" },
];

const lineData = [
  { hour: "12 PM", count: 3 },
  { hour: "2 PM", count: 5 },
  { hour: "4 PM", count: 7 },
  { hour: "6 PM", count: 6 },
  { hour: "8 PM", count: 4 },
  { hour: "10 PM", count: 5 },
  { hour: "12 AM", count: 4 },
];

const weekData = [
  { type: "A", count: 2 },
  { type: "B", count: 4 },
  { type: "C", count: 8 },
  { type: "D", count: 10 },
  { type: "E", count: 6 },
  { type: "F", count: 6 },
  { type: "G", count: 6 },
];

const Anomalies = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-6 lg:p-8">
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Pie Chart */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-md flex justify-center">
          <div>
            <h2 className="text-center mb-2 font-bold">Total Anomalies</h2>
            <PieChart width={250} height={250}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </div>
        </div>

        {/* Line Chart (24-hour) */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex justify-center">
          <div>
            <h2 className="text-center mb-2 font-bold">
              Total Number of Anomalies<br></br> in 24 Hours
            </h2>
            <LineChart width={300} height={250} data={lineData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="hour">
                <Label
                  value="Time (in hours)"
                  position="bottom"
                  offset={0}
                  className="text-white"
                />
              </XAxis>
              <YAxis dataKey="count">
                <Label
                  value="Anomaly Count"
                  angle={-90}
                  position="left middle"
                  offset={-15}
                  className="text-white"
                />
              </YAxis>
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                label="Anamoly in a Day"
                stroke="#42A5F5"
              />
            </LineChart>
          </div>
        </div>

        {/* Line Chart (Past Week) */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex justify-center">
          <div>
            <h2 className="text-center mb-2 font-bold">
              Number of Anomalies <br></br>in Past Week
            </h2>
            <LineChart width={300} height={250} data={weekData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="type">
                <Label
                  value="Type of Anamoly"
                  position="bottom"
                  offset={0}
                  className="text-white"
                />
              </XAxis>
              <YAxis dataKey="count">
                <Label
                  value="Anomaly Count"
                  angle={-90}
                  position="left middle"
                  offset={-15}
                  className="text-white"
                />
              </YAxis>
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                label="Anamoly in a Week"
                stroke="#FFFF66"
              />
            </LineChart>
          </div>
        </div>
      </div>

      {/* Filters & Buttons */}
      <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
        <button className="bg-white px-2 py-1 text-sm 2xl:text-xl text-black font-semibold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040]">
          ADD FILTER ▼
        </button>

        <button className="bg-white px-2 text-sm 2xl:text-xl text-black font-semibold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040]">
          SELECT ANOMALY TYPE ▼
        </button>

        <button
          className="bg-[#B1D5BD] text-sm 2xl:text-xl text-black font-semibold px-2 rounded-md w-full md:w-auto"
          style={{
            boxShadow:
              "0px 4px 4px 0px #0000007A, 1px 4px 4px 0px #FFFFFFBF inset",
          }}
        >
          EXPORT TO EXCEL
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-gray-800 p-6 mt-6 rounded-lg overflow-x-auto">
        <h3 className="text-lg font-bold">Anomaly Data</h3>
        <table className="w-full mt-4 border-collapse border border-gray-600 text-sm md:text-base">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-2 text-left">TIMESTAMP</th>
              <th className="p-2 text-left">ORIGINATOR</th>
              <th className="p-2 text-left">ANOMALY TYPE</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-600">
              <td className="p-2">
                <strong>Date:</strong> 03/01/2025
                <br />
                <strong>Time:</strong> 05:26:06 PM
              </td>
              <td className="p-2">DG-Set</td>
              <td className="p-2">
                <strong>Fuel Level:</strong> Level - Below 5
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Anomalies;
