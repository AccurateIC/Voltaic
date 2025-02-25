import React, { useState } from "react";
import { FiSearch, FiRefreshCcw, FiFilter } from "react-icons/fi";

const initialAlarmsData = [
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
  {
    createdTime: "2024-11-06 13.42.03",
    originator: "DG-SET",
    type: "FUEL LEVEL ALARM",
    number: 3,
    severity: "WARNING",
    status: "ACTIVE UNACKNOWLEDGED",
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

const AlarmsBackup = () => {
  const [alarmsData, setAlarmsData] = useState(initialAlarmsData);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOthersOptions, setShowOthersOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index);
  };

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setShowOthersOptions(selectedValue === "Others");
  };

  const handleDelete = (index) => {
    const updatedAlarms = alarmsData.filter((_, i) => i !== index);
    setAlarmsData(updatedAlarms);
  };

  const handleResolve = (index) => {
    const updatedAlarms = alarmsData.map((alarm, i) => (i === index ? { ...alarm, status: "RESOLVED" } : alarm));
    setAlarmsData(updatedAlarms);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setAlarmsData(initialAlarmsData);
  };

  const filteredAlarms = alarmsData.filter((alarm) =>
    Object.values(alarm).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-1 md:p-2 min-h-screen bg-[#1E1E1E] text-white">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-center">ALARM</h2>

      <div className="bg-gray-800 text-white p-2 flex flex-col md:flex-row justify-between rounded-t-md">
        <button
          className="bg-gray-700 px-3 py-2 rounded text-sm flex items-center mb-2 md:mb-0"
          onClick={() => setShowFilters(!showFilters)}>
          <FiFilter className="mr-2" />
          Filters
        </button>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-700 p-3 rounded-md text-md" onClick={handleRefresh}>
            <FiRefreshCcw />
          </button>
          <div className="flex items-center bg-gray-700 p-2 rounded-md">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="bg-transparent text-white text-sm focus:outline-none pl-2"
            />
            <FiSearch />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-800 p-3 rounded-md mt-2 flex flex-wrap gap-4 text-white">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Date</label>
            <input type="date" className="p-2 border rounded bg-black text-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Time</label>
            <input type="time" className="p-2 border rounded bg-black text-white" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Alarm Type</label>
            <select className="w-[10rem] p-1 border rounded bg-black text-white" onChange={handleSelectChange}>
              <option>Anamoly type</option>
              <option>PDM</option>
              <option>Others</option>
            </select>
          </div>

          {showOthersOptions && (
            <div className="flex flex-col">
              <label className="text-sm font-medium">Other Options:</label>
              <select className="w-[10rem] p-1 border rounded bg-black text-white">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-300 rounded-b-md mt-2">
        <table className="min-w-full bg-white text-black text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200 text-left font-bold">
              <th className="p-3">CREATED TIME</th>
              <th className="p-3">ORIGINATOR</th>
              <th className="p-3">ALARM TYPE</th>
              <th className="p-3">No.</th>
              <th className="p-3">SEVERITY</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlarms.map((alarm, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(index)}
                className={`border-t cursor-pointer hover:bg-[#F0F4F8] ${selectedRow === index ? "bg-[#B1D5BD]" : ""}`}>
                <td className="p-2">{alarm.createdTime}</td>
                <td className="p-2">{alarm.originator}</td>
                <td className="p-2">{alarm.type}</td>
                <td className="p-2">{alarm.number}</td>
                <td className="p-2 text-red-500 font-bold">{alarm.severity}</td>
                <td className="p-2">{alarm.status}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(index);
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Resolve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlarmsBackup;
