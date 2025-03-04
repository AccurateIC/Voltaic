import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, Label } from "recharts";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";

const anomalyData = {
  today: [
    {
      Timestamp: "17/02/2025 - 10:15:30 AM",
      Originator: "DG-Set",
      Type: "Fuel Level - Below 5",
    },
    {
      Timestamp: "17/02/2025 - 01:25:45 PM",
      Originator: "Sensor-A",
      Type: "Temperature Spike",
    },
  ],
  week: [
    {
      Timestamp: "15/02/2025 - 02:45:15 PM",
      Originator: "Sensor-B",
      Type: "Pressure Drop",
    },
    {
      Timestamp: "13/02/2025 - 11:35:20 AM",
      Originator: "DG-Set",
      Type: "Voltage Fluctuation",
    },
  ],
  month: [
    {
      Timestamp: "02/02/2025 - 08:15:50 AM",
      Originator: "Sensor-A",
      Type: "Fuel Level - Below 2",
    },
    {
      Timestamp: "05/02/2025 - 06:25:35 PM",
      Originator: "DG-Set",
      Type: "Temperature Spike",
    },
  ],
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

  const getGraphData = (item) => {
    const times = ["10:00", "12:00", "14:00", "16:00", "18:00"];
    const graphValues = times.map((time) => ({
      hour: time,
      count: Math.floor(Math.random() * 10) + 1,
    }));
    setGraphData(graphValues);
    setShowGraph(true);
  };

  const handleShowGraph = () => {
    setShowGraph(!showGraph);
  };

  return (
    <div className="h-full w-full flex flex-col p-2 overflow-x-scroll">
      <div className="bg-gray-900 text-white p-6">
        {/*
        <h2 className="text-2xl font-bold mb-6">Anomalies Overview</h2>
          */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            onClick={() => handleAnomalyClick("today")}
            className="bg-red-500 p-6 rounded-lg flex items-center gap-6 shadow-md cursor-pointer">
            <FaExclamationTriangle className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Today's Anomaly</h3>
              <p className="text-2xl font-semibold">{anomalyData.today.length}</p>
            </div>
          </div>

          <div
            onClick={() => handleAnomalyClick("week")}
            className="bg-blue-400 p-6 rounded-lg flex items-center gap-6 shadow-md cursor-pointer">
            <FaCalendarWeek className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Weekly Anomaly</h3>
              <p className="text-2xl font-semibold">{anomalyData.week.length}</p>
            </div>
          </div>

          <div
            onClick={() => handleAnomalyClick("month")}
            className="bg-[#B1D5BD] p-6 rounded-lg flex items-center gap-6 shadow-md cursor-pointer">
            <FaCalendarAlt className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Monthly Anomaly</h3>
              <p className="text-2xl font-semibold">{anomalyData.month.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Date:</label>
            <input
              type="date"
              className="w-full p-2 border rounded text-white"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Time:</label>
            <input
              type="time"
              className="w-full p-2 border rounded text-white"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg overflow-x-auto">
          {/* <button
            className="mb-4 p-1 ml-[45rem] bg-[#B1D5BD] rounded text-black font-semibold inline-flex items-center justify-center shadow-inner"
            style={{
              boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px #0000007A, inset 1px 4px 4px 0px #FFFFFFBF",
            }}
            onClick={exportToExcel}>
            Export to Excel
          </button> */}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2">Timestamp</th>
                <th className="p-2">Originator</th>
                <th className="p-2">Anomaly Type</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="p-2">{item.Timestamp}</td>
                  <td className="p-2">{item.Originator}</td>
                  <td className="p-2">{item.Type}</td>
                  <td className="p-2">
                    <button className="bg-blue-500 px-3 py-1 rounded-md" onClick={handleShowGraph}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showGraph && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold">Anomaly Line Graph</h3>
            <div className="flex flex-row">
              <LineChart width={600} height={300} data={graphData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="hour">
                  <Label value="Time" position="insideBottom" offset={-5} />
                </XAxis>
                <YAxis dataKey="count">
                  <Label value="Count" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#42A5F5" />
              </LineChart>
              <div className="flex items-start">
                <button className="btn btn-error" onClick={() => setShowGraph(false)}>
                  X
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anomalies;
