import React, { useState } from "react";
import { FiSearch, FiRefreshCcw, FiFilter } from "react-icons/fi";

const alarmsData = [
  {
    createdTime: "2024-11-06 17.57.01",
    originator: "DG-SET",
    type: "FUEL LEVEL ALARM",
    number: 1,
    severity: "WARNING",
    status: "ACTIVE UNACKNOWLEDGED",
  },
  {
    createdTime: "2024-11-06 13.42.03",
    originator: "DG-SET",
    type: "FUEL LEVEL ALARM",
    number: 2,
    severity: "WARNING",
    status: "INACTIVE UNACKNOWLEDGED",
  },
  {
    createdTime: "2024-11-06 13.42.03",
    originator: "DG-SET",
    type: "FUEL LEVEL ALARM",
    number: 3,
    severity: "WARNING",
    status: "INACTIVE UNACKNOWLEDGED",
  },
  {
    createdTime: "2024-11-06 13.42.03",
    originator: "DG-SET",
    type: "FUEL LEVEL ALARM",
    number: 4,
    severity: "WARNING",
    status: "ACTIVE UNACKNOWLEDGED",
  },
];

const Alarms = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index);
  };

  return (
    <div className="p-4 bg- text-white min-h-screen">
      <h2 className="text-lg font-bold mb-4  ">ALARM</h2>
      <div className="bg-gray-200 text-white p-2 flex justify-between rounded-t-md">
        <button 
          className="bg-gray-800 px-3 py-1 rounded text-sm flex items-center" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter className="mr-2" />
          Filters
        </button>
        <div className="flex space-x-3">
          <button className="bg-gray-800 p-3 rounded-md text-md">
            <FiRefreshCcw />
          </button>
          <div className="flex items-center bg-gray-800 p-2 rounded-md">
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent text-white text-sm focus:outline-none pl-2"
            />
            <FiSearch />
          </div>
        </div>
      </div>
      {showFilters && (
        <div className="bg-gray-800 p-3 rounded-md mt-2 flex gap-2">
          <label className="block text-sm font-medium">Created Time</label>
          <input type="date" className="w-[10rem] p-1 border rounded bg-black text-white" />
          {/* <label className="block text-sm font-medium mt-2">Originator</label>
          <input type="text" className="w-full p-1 border rounded bg-black text-white" /> */}
          <label className="block text-sm font-medium mt-2">Alarm Type</label>
          <select className="w-[10rem] p-1 border rounded bg-black text-white">
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>
          <label className="block text-sm font-medium mt-2">Severity</label>
          <select className="w-[10rem] p-1 border rounded bg-black text-white">
            <option>All</option>
            <option>Warning</option>
            <option>Critical</option>
          </select>
          <label className="block text-sm font-medium mt-2">Status</label>
          <select className="w-[10rem] p-1 border rounded bg-black text-white">
            <option>All</option>
            <option>Active</option>
            <option>Resolved</option>
          </select>
        </div>
      )}
      <div className="overflow-x-auto border border-gray-300 rounded-b-md mt-2">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr className="bg-gray-200 text-left text-sm font-bold">
              <th className="p-3">CREATED TIME</th>
              <th className="p-3">ORIGINATOR</th>
              <th className="p-3">ALARM TYPE</th>
              <th className="p-3">No.</th>
              <th className="p-3">SEVERITY</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">...</th>
            </tr>
          </thead>
          <tbody>
            {alarmsData.map((alarm, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(index)}
                className={`border-t cursor-pointer ${
                  selectedRow === index ? "bg-[#B1D5BD]" : ""
                }`}
              >
                <td
                  className={`p-2 rounded-l-md ${
                    selectedRow === index ? "bg-[#B1D5BD]" : ""
                  }`}
                >
                  {alarm.createdTime}
                </td>
                <td className="p-2">{alarm.originator}</td>
                <td className="p-2">{alarm.type}</td>
                <td className="p-2">{alarm.number}</td>
                <td className="p-2 text-red-500 font-bold">{alarm.severity}</td>
                <td className="p-2">{alarm.status}</td>
                <td className="p-2">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alarms;
