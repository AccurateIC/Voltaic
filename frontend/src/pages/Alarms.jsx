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
    status: "ACTIVE UNACKNOWLEDGED",
  },
];

const Alarms = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index); // Toggle selection
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">ALARM</h2>
      <div className="bg-black text-white p-2 flex justify-between rounded-t-md">
        <button className="bg-gray-800 px-3 py-1 rounded text-sm flex items-center">
          <FiFilter className="mr-2" />
          Filters
        </button>
        <button className="bg-gray-800 px-2 py-1 rounded text-sm flex items-center">
          <FiRefreshCcw className="mr-0" /> 
        </button>
        
        <button className="bg-gray-800 px-2 py-1 rounded text-sm flex items-center">
          <FiSearch className="mr-0" /> 
        </button>
      </div>
      <div className="overflow-x-auto border border-gray-300 rounded-b-md">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr className="bg-gray-200 text-left text-sm font-bold">
              <th className="p-2">CREATED TIME</th>
              <th className="p-2">ORIGINATOR</th>
              <th className="p-2">ALARM TYPE</th>
              <th className="p-2">No.</th>
              <th className="p-2">SEVERITY</th>
              <th className="p-2">STATUS</th>
              <th className="p-2">...</th>
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
