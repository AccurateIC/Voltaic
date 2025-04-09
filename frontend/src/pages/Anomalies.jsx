import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { DateTime } from "luxon";

const Anomalies = () => {
  const [anomalyData, setAnomalyData] = useState({ today: [], week: [], month: [] });
  const [filteredData, setFilteredData] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
    property: "Property",
    anomalyStatus: "",
  });

  const handleFromDateFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, fromDate: e.target.value }));
  };

  const handleToDateFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, toDate: e.target.value }));
  };

  const handleFromTimeChange = (e) => {
    setFilters((prev) => ({ ...prev, fromTime: e.target.value }));
  };

  const handleToTimeChange = (e) => {
    setFilters((prev) => ({ ...prev, toTime: e.target.value }));
  };

  const getAnomalyDataByPeriod = (notifications) => {
    const now = DateTime.local();
    const todayStart = now.startOf("day");
    const weekStart = now.startOf("week");
    const monthStart = now.startOf("month");

    const data = { today: [], week: [], month: [] };

    notifications.forEach((notif) => {
      const notifTime = DateTime.fromMillis(parseInt(notif.startedAt));
      if (notifTime >= monthStart) {
        data.month.push(notif);
        if (notifTime >= weekStart) {
          data.week.push(notif);
          if (notifTime >= todayStart) {
            data.today.push(notif);
          }
        }
      }
    });

    return data;
  };

  useEffect(() => {
    let filtered = [...notifications];

    // Combine fromDate and fromTime
    let fromDateTime = null;
    if (filters.fromDate && filters.fromTime) {
      fromDateTime = DateTime.fromISO(`${filters.fromDate}T${filters.fromTime}`);
    }

    // Combine toDate and toTime
    let toDateTime = null;
    if (filters.toDate && filters.toTime) {
      toDateTime = DateTime.fromISO(`${filters.toDate}T${filters.toTime}`);
    }

    // Filter by fromDateTime
    if (fromDateTime) {
      filtered = filtered.filter((notif) => {
        const startedAt = DateTime.fromMillis(parseInt(notif.startedAt));
        return startedAt >= fromDateTime;
      });
    }

    // Filter by toDateTime
    if (toDateTime) {
      filtered = filtered.filter((notif) => {
        const startedAt = DateTime.fromMillis(parseInt(notif.startedAt));
        return startedAt <= toDateTime;
      });
    }

    // Filter by property
    if (filters.property && filters.property !== "Property") {
      filtered = filtered.filter((notif) => notif.archive.gensetProperty.propertyName === filters.property);
    }

    setFilteredNotifications(filtered);
  }, [filters, notifications]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const dt = DateTime.fromISO(timestamp);
    return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  };


  useMessageBus("notification", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    fetchNotifications();
  });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch notification data");
      }

      const data = await response.json();
      setNotifications(data);

      const anomalyStats = getAnomalyDataByPeriod(data);
      setAnomalyData(anomalyStats);
      setFilteredData(anomalyStats.today);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching notification data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/property/getAll`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error((await res.json()).message);
        const data = await res.json();
        setGensetProperties(data);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching genset property data");
      }
    };
    fetchProperties();
  }, []);

  const handleAnomalyClick = (period) => {
    setSelectedPeriod(period);
    const now = DateTime.local();
    let start;
    if (period === "today") start = now.startOf("day");
    else if (period === "week") start = now.startOf("week");
    else if (period === "month") start = now.startOf("month");
    else start = now.startOf("day");

    const filtered = notifications.filter((notif) => DateTime.fromMillis(parseInt(notif.startedAt)).toLocal() >= start);
    setFilteredData(filtered);
    setFilteredNotifications(filtered);
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: new Date().toISOString().split("T")[0],
      property: "Property",
      anomalyStatus: "",
      fromTime: "",
      toTime: "",
    });
    setFromTime("");
    setToTime("");
  };

  const handleViewClick = (entry) => {
    if (!entry.startedAt || !entry.finishedAt) {
      toast.error("Both startedAt and finishedAt must be present.");
      return;
    }

    const data = [
      { x: parseInt(entry.startedAt), y: 1, label: "Started At" },
      { x: parseInt(entry.finishedAt), y: 2, label: "Finished At" },
    ];
    setGraphData(data);
    setShowGraph(true);
  };

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data available to export!");
      return;
    }

    const cleanData = filteredData.map((item) => ({
      id: item.id,
      anomaly: item.anomaly,
      status: item.status,
      date: formatTimestamp(item.startedAt),
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anomaly Data");

    const fileName = `Anomaly_Data_${selectedPeriod || "All"}.xlsx`;
    XLSX.writeFile(wb, fileName);
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

        <div className="mt-5 flex flex-wrap items-center gap-4 bg-gray-800 p-2 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="text-white">From Date:</label>
            <input
              type="date"
              value={filters.fromDate}
              // onChange={(e) => setFromDate(e.target.value)}
              onChange={handleFromDateFilterChange}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            <label className="text-white">To Date:</label>
            <input
              type="date"
              value={filters.toDate}
              // onChange={(e) => setToDate(e.target.value)}
              onChange={handleToDateFilterChange}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-white">From Time:</label>
            <input
              type="time"
              value={filters.fromTime}
              onChange={handleFromTimeChange}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            <label className="text-white">To Time:</label>
            <input
              type="time"
              value={filters.toTime}
              onChange={handleToTimeChange}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
          </div>

          <button onClick={handleResetFilters} className="bg-gray-500 px-4 py-2 rounded-lg text-white">
            Reset
          </button>

          <button onClick={exportToExcel} className="bg-green-500 px-4 py-2 rounded-lg text-white">
            Export to Excel
          </button>
        </div>

        <div className="mt-2 bg-sky-950 p-4 rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-950 text-base-200">
                <th>#</th>
                <th>Started At</th>
                <th>Summary</th>
                <th>Message</th>
                <th>Finished At</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody className="bg-sky-950/50">
              {filteredNotifications.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{formatTimestamp(entry.startedAt)}</td>
                  <td>{entry.summary}</td>
                  <td>{entry.message}</td>
                  <td>{formatTimestamp(entry.finishedAt)}</td>
                  <td>
                    <button className="bg-blue-500 px-5 py-3.5 rounded-md" onClick={() => handleViewClick(entry)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Graph */}
        {showGraph && graphData.length > 0 ? (
          <div className="mt-6 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">Anomaly Detection Timeline</h3>
            <LineChart width={900} height={400} data={graphData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                tickFormatter={(tick) => DateTime.fromMillis(tick).toLocal().toFormat("HH:mm:ss")}
                label={{
                  value: "Timestamp",
                  position: "insideBottom",
                  offset: -10,
                  style: { fill: "#fff", fontSize: 14 },
                }}
                stroke="#ffffff"
              />
              <YAxis
                type="number"
                domain={[0, 3]}
                ticks={[1, 2]}
                tickFormatter={(tick) => (tick === 1 ? "Started At" : tick === 2 ? "Finished At" : "")}
                label={{
                  value: "Anomaly Event",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#fff", fontSize: 14 },
                }}
                stroke="#ffffff"
              />
              <Tooltip
                formatter={(val, name, props) =>
                  `${props.payload.label}: ${DateTime.fromMillis(props.payload.x).toLocal().toFormat("HH:mm:ss")}`
                }
                labelFormatter={(label) => `Time: ${DateTime.fromMillis(label).toLocal().toFormat("HH:mm:ss")}`}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#00d4ff"
                name="Anomaly Event"
                dot={{ r: 6 }}
                isAnimationActive={true}
              />
            </LineChart>
          </div>
        ) : (
          showGraph && <p className="text-red-500 text-center mt-4">No data available for graph.</p>
        )}
      </div>
    </div>
  );
};

export default Anomalies;
