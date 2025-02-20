import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Label,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";

const weekData = [
  { type: "A", count: 2 },
  { type: "B", count: 4 },
  { type: "C", count: 8 },
  { type: "D", count: 10 },
  { type: "E", count: 6 },
  { type: "F", count: 9 },
  { type: "G", count: 2 },
];

const AnomalyWeek = () => {
  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-lg flex justify-center items-center w-full">
      <div className="w-full max-w-4xl">
        <h2 className="text-center mb-4 md:mb-5 font-bold text-white text-lg md:text-xl">
          Number of Anomalies in Past Week
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weekData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="type" tick={{ fill: "#fff", fontSize: 16 }}>
              <Label value="Type of Anomaly" position="insideBottom" offset={-15} style={{ fill: "#fff", fontSize: 14 }} />
            </XAxis>
            <YAxis tick={{ fill: "#fff", fontSize: 14 }}>
              <Label value="Anomaly Count" angle={-90} position="insideLeft" style={{ fill: "#fff", fontSize: 14 }} />
            </YAxis>
            <Tooltip contentStyle={{ backgroundColor: "#222", border: "none", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#fff", fontSize: 14, marginBottom: "-25px" }} />

            <Line type="monotone" dataKey="count" name="Anomaly in a Week" stroke="#FFFF66" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const lineData = [
  { hour: "12 PM", count: 3 },
  { hour: "2 PM", count: 5 },
  { hour: "4 PM", count: 7 },
  { hour: "6 PM", count: 6 },
  { hour: "8 PM", count: 4 },
  { hour: "10 PM", count: 1 },
  { hour: "12 AM", count: 4 },
  { hour: "2 AM", count: 5 },
  { hour: "4 AM", count: 7 },
  { hour: "6 AM", count: 2 },
  { hour: "8 AM", count: 4 },
  { hour: "10 AM", count: 5 },
  { hour: "12 PM", count: 3 },
];

const AnomaliesLineChart = () => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg flex justify-center items-center">
      <div className="w-full max-w-3xl">
        <h2 className="text-center mb-5 font-bold text-white text-lg md:text-xl">Total Number of Anomalies in 24 Hours</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="1 1" />
            <XAxis dataKey="hour" tick={{ fill: "#fff", fontSize: 16 }}>
              <Label value="Time (in hours)" position="insideBottom" offset={-15} style={{ fill: "#fff", fontSize: 14 }} />
            </XAxis>
            <YAxis tick={{ fill: "#fff", fontSize: 14 }}>
              <Label value="Anomaly Count" angle={-90} position="insideLeft" style={{ fill: "#fff", fontSize: 14 }} />
            </YAxis>
            <Tooltip />
            <Legend wrapperStyle={{ color: "#fff", fontSize: 14, marginBottom: "-25px" }} />
            {lineData.map((data, index) => (
              <ReferenceLine key={index} x={data.hour} stroke="#FF0000" strokeDasharray="3 3" />
            ))}
            <Line type="monotone" dataKey="count" name="Anomaly in a Day" stroke="#42A5F5" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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

  return (
    <div className="bg-gray-900 text-white min-h-screen p-1 md:p-2 lg:p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnomaliesLineChart />
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <AnomalyWeek />
        </div>
      </div>

      <div className="bg-gray-900 text-white min-h-screen p-6">
        <h2 className="text-2xl font-bold mb-6">Anomalies Overview</h2>

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
          <button
            className="mb-4 p-1 ml-[45rem] bg-[#B1D5BD] rounded text-black font-semibold inline-flex items-center justify-center shadow-inner"
            style={{
              boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px #0000007A, inset 1px 4px 4px 0px #FFFFFFBF",
            }}
            onClick={exportToExcel}>
            Export to Excel
          </button>

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
                    <button className="bg-blue-500 px-3 py-1 rounded-md" onClick={() => getGraphData(item)}>
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
            <button className="mt-4 bg-red-500 px-4 py-2 rounded-md" onClick={() => setShowGraph(false)}>
              Close Graph
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anomalies;
