import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, Label } from "recharts";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { DateTime } from "luxon";

const anomalyData = {
  today: [],
  week: [],
  month: [],
};

const Anomalies = () => {
  const [filteredData, setFilteredData] = useState(anomalyData.today);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [notifications, setNotifications] = useState([]); // original notifications
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: new Date().toISOString().split("T")[0],
    property: "Property",
    anomalyStatus: "",
  });

  // apply filters whenever filters or notifications change
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by date range
    if (filters.fromDate) {
      filtered = filtered.filter(
        (notif) => DateTime.fromMillis(parseInt(notif.startedAt)) >= DateTime.fromISO(filters.fromDate)
      );
    }
    if (filters.toDate) {
      filtered = filtered.filter(
        (notif) => DateTime.fromMillis(parseInt(notif.startedAt)) <= DateTime.fromISO(filters.toDate).endOf("day")
      );
    }

    // Filter by property
    if (filters.property && filters.property !== "Property") {
      filtered = filtered.filter((notif) => notif.archive.gensetProperty.propertyName === filters.property);
    }

    // Filter by anomaly status
    if (filters.anomalyStatus) {
      filtered = filtered.filter(
        (notif) =>
          (filters.anomalyStatus === "Resolved" && !notif.shouldBeDisplayed) ||
          (filters.anomalyStatus === "Unresolved" && notif.shouldBeDisplayed)
      );
    }

    setFilteredNotifications(filtered);
  }, [filters, notifications]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const dt = DateTime.fromMillis(parseInt(timestamp));
    return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  };

  useMessageBus("notifications", (msg) => {
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
      console.log("alarms", data);
      setNotifications(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching notification data");
    } finally {
      setIsLoading(false);
    }
  };

  // initial fetch of notifications
  useEffect(() => {
    console.log("Alarms page mount effect running");
    fetchNotifications();
  }, []);

  // fetch genset properties
  // TODO: for now it is a lot cheaper to fetch all notifications and then apply filtering on them
  //       in the future, pagination should be implemented to reduce database querying times
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/property/getAll`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch genset data");
        }
        const data = await response.json();
        setGensetProperties(data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error fetching genset property data");
      }
    };
    fetchProperties();
  }, []);

  const handleFromDateFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, fromDate: event.target.value }));
  };

  const handleToDateFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, toDate: event.target.value }));
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: new Date().toISOString().split("T")[0],
      property: "Property",
      anomalyStatus: "",
    });
  };

  const handleViewClick = (entry) => {
    if (!entry.startedAt) {
      toast.error("No startedAt timestamp available.");
      return;
    }
  
    // Generate dummy finishedAt if missing (5 to 10 minutes after startedAt)
    const finishedAt = entry.finishedAt
      ? parseInt(entry.finishedAt)
      : parseInt(entry.startedAt) + Math.floor(Math.random() * (600000 - 300000) + 300000); // Random 5-10 min
  
    setGraphData([
      {
        x: parseInt(entry.startedAt), // StartedAt as X-axis
        y: finishedAt, // FinishedAt as Y-axis (with dummy data if missing)
      },
    ]);
  
    setShowGraph(true);
  };
  

  const handleEntryResolution = async (notificationId) => {
    try {
      // make req to backend to mark notification as read
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/read/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || `Failed to resolve notification`);
        return;
      }

      // re fetch notifications?
      await fetchNotifications();
    } catch (err) {
      console.error("Error resolving notification:", err);
      toast.error(`Failed to resolve notification: ${err.message}`);
    }
  };

  const handleAnomalyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, anomalyStatus: event.target.value }));
  };

  const handleGensetPropertyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, property: event.target.value }));
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

  // const formatTimestamp = (timestamp) => {
  //   if (!timestamp) return;
  //   const dt = DateTime.fromMillis(parseInt(timestamp));
  //   return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  // };

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
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            <label className="text-white">To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-white">From Time:</label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            />

            <label className="text-white">To Time:</label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
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
                <th>Started At</th>
                <th>Summary</th>
                <th>Message</th>
                <th>Anomaly Status</th>
                <th>Finished At</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody className="bg-sky-950/50">
              {filteredNotifications.map((entry, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <td>{formatTimestamp(entry.startedAt)}</td>
                  <td>{entry.summary}</td>
                  <td>{entry.message}</td>
                  <td>{entry.shouldBeDisplayed ? "" : ""}</td>
                  <td>{formatTimestamp(entry.finishedAt)}</td>
                  <td>
                    <button className="bg-blue-500 px-5 py-2 rounded-md" onClick={() => handleViewClick(entry)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Graph Section */}
        {showGraph && graphData.length > 0 ? (
          <div className="mt-6 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg mb-4">Anomaly Graph</h3>
            <LineChart width={600} height={300} data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                label={{ value: "Started At (Timestamp)", position: "insideBottom", offset: -5 }}
                tickFormatter={(tick) => DateTime.fromMillis(tick).toFormat("HH:mm:ss")}
              />
              <YAxis
                label={{ value: "Finished At (Timestamp)", angle: -90, position: "insideLeft" }}
                tickFormatter={(tick) => DateTime.fromMillis(tick).toFormat("HH:mm:ss")}
              />
              <Tooltip labelFormatter={(value) => DateTime.fromMillis(value).toFormat("HH:mm:ss")} />
              <Legend />
              <Line type="monotone" dataKey="y" stroke="#82ca9d" />
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
