import React, { useState } from "react";
import * as XLSX from "xlsx";

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
  { hour: "2 AM", count: 5 },
  { hour: "4 AM", count: 7 },
  { hour: "6 AM", count: 6 },
  { hour: "8 AM", count: 4 },
  { hour: "10 AM", count: 5 },
  { hour: "12 PM", count: 3 },
];

const weekData = [
  { type: "A", count: 2 },
  { type: "B", count: 4 },
  { type: "C", count: 8 },
  { type: "D", count: 10 },
  { type: "E", count: 6 },
  { type: "F", count: 9 },
  { type: "G", count: 2 },
];

const anomalyData = [
  { Timestamp: "03/01/2025 - 05:26:06 PM", Originator: "DG-Set", "Anomaly Type": "Fuel Level - Below 5" },
  { Timestamp: "30/01/2025 - 06:00:00 PM", Originator: "DG-Set", "Anomaly Type": "Fuel Level - Below 3" },
  { Timestamp: "30/01/2025 - 06:15:09 PM", Originator: "DG-Set", "Anomaly Type": "Fuel Level - Below 5" },
  { Timestamp: "30/01/2025 - 06:26:23 PM", Originator: "DG-Set", "Anomaly Type": "Fuel Level - Below 2" },

];

const Anomalies = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const exportToExcel = () => {
    if (anomalyData.length === 0) {
      alert("No data available to export!");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(anomalyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anomaly Data");
    XLSX.writeFile(wb, "Anomaly_Data.xlsx");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
<div className="bg-gray-800 p-8 rounded-lg shadow-md flex justify-center">
  <div>
    <h2 className="text-center mb-2 font-bold">Total Anomalies</h2>
    <PieChart width={250} height={250}>
      <defs>
        {pieData.map((entry, index) => (
          <linearGradient id={`gradient-${index}`} key={index} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
          </linearGradient>
        ))}
      </defs>

      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
        stroke="#333"
        strokeWidth={1.5} 
      >
        {pieData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
        ))}
      </Pie>
      <Legend />
    </PieChart>
  </div>
</div>
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

      <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
      <div className="relative w-full md:w-auto">
          <button onClick={() => setShowFilter(!showFilter)} className="bg-white px-6 py-2 text-sm 2xl:text-xl text-black font-bold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040]">
            ADD FILTER ▼
          </button>
          {showFilter && (
            <div className="absolute mt-1 bg-gray-800 p-4 shadow-md rounded-md w-45 z-10">
              <label className="block text-sm font-medium">Date</label>
              <input type="date" className="w-auto p-1 border rounded" />
              <label className="block text-sm font-medium">Time</label>
              <input type="time" className="w-[9rem] p-1 border rounded" />
            </div>
          )}
        </div>

        <div>
        <button onClick={() => setShowDropdown(!showDropdown)} 
        className="bg-white px-4 py-2 text-sm 2xl:text-xl text-black font-bold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040]">
          SELECT ANOMALY TYPE ▼
        </button>

      {showDropdown && (
        <div className="absolute mt-1 bg-gray-700 p-2 shadow-md rounded-md w-48 z-10">
          <ul className="text-white">
            <li className="p-2 hover:bg-gray-700 cursor-pointer">batteryVolts</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">chargeAltVolts</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">engineSpeed</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">engineFuelLevel</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">l1Voltage</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">l2Voltage</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">l3Voltage</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">l1Current</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">l2Current</li>
            <li className="p-2 hover:bg-gray-700 cursor-pointer">l3Current</li>

          </ul>
        </div>
      )}
      </div>
          
        <button
          onClick={exportToExcel}
          className="bg-[#B1D5BD] text-sm 2xl:text-xl text-black font-bold px-4 py-2 rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040]"
        >
          EXPORT TO EXCEL
        </button>
      </div>

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
            {anomalyData.map((item, index) => (
              <tr key={index} className="border-b border-gray-600">
                <td className="p-2">{item.Timestamp}</td>
                <td className="p-2">{item.Originator}</td>
                <td className="p-2">{item["Anomaly Type"]}</td>
              </tr>
            ))}
          </tbody>
          <tbody>
            <tr className="border-b border-gray-600">
              <td className="p-2">
                <strong>Date:</strong> 31/01/2025
                <br />
                <strong>Time:</strong> 06:00:06 PM
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
