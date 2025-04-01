import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, Label } from "recharts";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";

const anomalyData = {
  today: [],
  week: [],
  month: [],
};

const Anomalies = () => {
  const [filteredData, setFilteredData] = useState(anomalyData.today);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const handleAnomalyClick = (period) => {
    setSelectedPeriod(period);
    setFilteredData(anomalyData[period]);
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data available to export!");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anomaly Data");
    XLSX.writeFile(wb, `Anomaly_Data_${selectedPeriod}.xlsx`);
  };

  const filterData = () => {
    const filtered = anomalyData[selectedPeriod].filter((item) => {
      const [date, time] = item.Timestamp.split(" - ");
      const itemDate = new Date(date);

      if (fromDate && toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        if (itemDate < startDate || itemDate > endDate) return false;
      }

      if (fromTime && toTime) {
        const itemTime = time.split(" ")[0];
        if (itemTime < fromTime || itemTime > toTime) return false;
      }

      return true;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData();
  }, [fromDate, toDate, fromTime, toTime, selectedPeriod]);

  const handleShowGraph = () => {
    setShowGraph(!showGraph);
  };

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setFromTime("");
    setToTime("");
  };

  return (
    <div className="h-full w-full flex flex-col p-2 overflow-x-scroll">
      <div className="h-20 bg-gray-900 text-white p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            onClick={() => handleAnomalyClick("today")}
            className="h-20 bg-red-500 p-6 rounded-lg flex items-center gap-6 shadow-md cursor-pointer">
            <FaExclamationTriangle className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Today's Anomaly</h3>
              <p className="text-2xl font-semibold">{anomalyData.today.length}</p>
            </div>
          </div>

          <div
            onClick={() => handleAnomalyClick("week")}
            className="h-20 bg-blue-400 p-6 rounded-lg flex items-center gap-6 shadow-md cursor-pointer">
            <FaCalendarWeek className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Weekly Anomaly</h3>
              <p className="text-2xl font-semibold">{anomalyData.week.length}</p>
            </div>
          </div>

          <div
            onClick={() => handleAnomalyClick("month")}
            className="h-20 bg-[#B1D5BD] p-6 rounded-lg flex items-center gap-6 shadow-md cursor-pointer">
            <FaCalendarAlt className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Monthly Anomaly</h3>
              <p className="text-2xl font-semibold">{anomalyData.month.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-4 bg-gray-800">
        <label>From Date:</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 rounded" />
          <label>To Date:</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="p-2 rounded" />
          <label>From Time:</label>
          <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} className="p-2 rounded" />
          <label>To Time:</label>
          <button onClick={resetFilters} className="bg-gray-500 px-4 py-2 rounded-lg">Reset</button>
        </div>

        <button onClick={exportToExcel} className="bg-green-500 px-4 py-2 rounded-lg mt-4">Export to Excel</button>

        <div className="mt-6 bg-sky-950 p-4 rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-950 text-base-200">
                <th>Started At</th>
                <th>Summary</th>
                <th>Message</th>
                <th>Anomaly Status</th>
                <th>Finished At</th>
                <th>Resolve</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="p-2">{item.startedAt}</td>
                  <td className="p-2">{item.summary}</td>
                  <td className="p-2">{item.message}</td>
                  <td className="p-2">{item.status}</td>
                  <td className="p-2">{item.finishedAt}</td>
                  <td className="p-2">
                    <button className="bg-blue-500 px-3 py-1 rounded-md" onClick={handleShowGraph}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Anomalies;
