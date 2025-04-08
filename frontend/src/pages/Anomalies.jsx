import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, Label } from "recharts";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { format } from "date-fns";

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
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

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

    setFilteredNotifications(filtered);
  }, [filters, notifications]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const dt = DateTime.fromISO(timestamp);
    return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  };

  useMessageBus("notifications", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    fetchNotifications();
  });

  useEffect(() => {
    if (selectedEntry) {
      console.log("selectedEntry updated dsdsd:", selectedEntry);
      console.log(selectedEntry.archive.gensetProperty.propertyName);
    }
  }, [selectedEntry]);

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
      console.log("/notification/getAll", data);
      setNotifications(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching notification data");
    } finally {
      setIsLoading(false);
    }

    if (
      !selectedEntry ||
      !selectedEntry.startedAt ||
      !selectedEntry.finishedAt ||
      !selectedEntry.archive?.gensetProperty?.propertyName
    ) {
      toast.error("Invalid selected entry data.");
      return;
    }

    const from = selectedEntry.startedAt;
    const to = selectedEntry.finishedAt;
    const propertyName = selectedEntry.archive.gensetProperty.propertyName;
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!selectedEntry) return;

      const propertyName = selectedEntry?.archive?.gensetProperty?.propertyName;
      const from = selectedEntry?.startedAt;
      const to = selectedEntry?.finishedAt;

      if (!propertyName || !from || !to) {
        console.error("Missing required fields in selectedEntry");
        toast.error("Incomplete data for fetching property info");
        return;
      }

      try {
        setIsLoading(true);
        const url = `${
          import.meta.env.VITE_ADONIS_BACKEND
        }/archive/getPropertyDataBetween?from=${from}&to=${to}&propertyName=${propertyName}`;

        console.log("Calling API:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch property data");
        }

        const data = await response.json();
        console.log("Property data response using from, to, property name:", data);

        const formattedData = data.map((item) => ({
          x: new Date(item.timestamp).getTime(), // keep it numeric
          y: item.propertyValue,
          label: "Anomaly Event",
        }));

        setGraphData(formattedData); // <-- you need this state for the chart
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error fetching property data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, [selectedEntry]);

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
        console.log("/property/getAll", data);
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
    if (!entry.startedAt || !entry.finishedAt) {
      toast.error("Both startedAt and finishedAt must be present.");
      return;
    }

    setSelectedEntry(entry);

    console.log("entry ", entry);
    console.log("entry startedAt", entry.startedAt);
    const startedAtMillis = DateTime.fromISO(entry.startedAt).toMillis();
    const finishedAtMillis = DateTime.fromISO(entry.finishedAt).toMillis();
    const value = entry.archive.propertyValue;

    const data = [
      { x: DateTime.fromISO(entry.startedAt).toMillis(), y: entry.archive.propertyValue, label: "Started At" },
      { x: DateTime.fromISO(entry.finishedAt).toMillis(), y: entry.archive.propertyValue, label: "Finished At" },
    ];
    console.log("data", data);
    // setGraphData(data);
    console.log("grapgdata", graphData);
    setShowGraph(true);
  };

  const handleAnomalyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, anomalyStatus: event.target.value }));
  };

  const handleGensetPropertyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, property: event.target.value }));
  };

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data available to export!");
      return;
    }

    console.log("Exporting data:", filteredData); // Debugging log

    const cleanData = filteredData.map((item) => ({
      id: item.id,
      anomaly: item.anomaly,
      status: item.status,
      date: item.date,
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

        {/* Graph Section */}
        {showGraph && graphData.length > 0 ? (
          <div className="mt-6 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">Anomaly Detection Timeline</h3>
            <LineChart width={1000} height={400} data={graphData} margin={{ top: 20, right: 10, left: 300, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="x"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(tick) => DateTime.fromMillis(tick).toFormat("HH:mm:ss")}
                label={{
                  value: "Timestamp",
                  position: "insideBottom",
                  offset: -10,
                  style: { fill: "#fff" },
                }}
                stroke="#ffffff"
              />

              <YAxis
                type="number"
                domain={[0, "dataMax + 10"]}
                label={{
                  value: "Property  Value",
                  dy: 50,
                  dx: -19,
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#fff" },
                }}
                stroke="#ffffff"
              />

              <Tooltip
                formatter={(val, name, props) =>
                  `${props.payload.label}: ${DateTime.fromMillis(props.payload.x).toFormat("HH:mm:ss")} Value: ${val}`
                }
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#ff0000"
                name="Anomaly Event"
                dot={{ r: 4 }}
                isAnimationActive={false}
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

//  Anomaly Event: undefined: 11:20:12 Value: 60
