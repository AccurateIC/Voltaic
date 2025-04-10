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
  const [selectedEntry, setSelectedEntry] = useState(null);
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

  console.log("notifications", notifications);

  const getAnomalyDataByPeriod = (notifications) => {
    const now = DateTime.local();
    const todayStart = now.startOf("day");
    const weekStart = now.startOf("week");
    const monthStart = now.startOf("month");

    const data = { today: [], week: [], month: [] };

    notifications.forEach((notif) => {
      const notifTime = DateTime.fromISO(notif.startedAt);
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
    console.log("Today’s anomalies:", data.today);
    console.log("Week’s anomalies:", data.week);
    console.log("Month’s anomalies:", data.month);

    return data;
  };
  console.log("agetAnomalyDataByPeriod", getAnomalyDataByPeriod(notifications));

  useEffect(() => {
    let filtered = [...notifications];

    console.log("fromDate:", filters.fromDate);
    console.log("fromTime:", filters.fromTime);
    console.log("toDate:", filters.toDate);
    console.log("toTime:", filters.toTime);

    let fromDateTime = null;
    if (filters.fromDate && filters.fromTime) {
      fromDateTime = DateTime.fromISO(`${filters.fromDate}T${filters.fromTime}`);
    }

    let toDateTime = null;
    if (filters.toDate && filters.toTime) {
      toDateTime = DateTime.fromISO(`${filters.toDate}T${filters.toTime}`);
    }

    if (fromDateTime) {
      filtered = filtered.filter((notif) => {
        const startedAt = DateTime.fromISO(notif.startedAt);

        return startedAt >= fromDateTime;
      });
    }

    console.log("toDateTime", toDateTime);

    if (toDateTime) {
      filtered = filtered.filter((notif) => {
        const startedAt = DateTime.fromISO(notif.startedAt);
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
      console.log("data", data);
      const anomalyStats = getAnomalyDataByPeriod(data);
      console.log("anomalyStats0", anomalyStats);
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
    const fetchPropertyData = async () => {
      if (!selectedEntry) return;

      const propertyName = selectedEntry?.archive?.gensetProperty?.propertyName;
      const from = DateTime.fromISO(selectedEntry?.startedAt).toUTC().toISO();
const to = selectedEntry?.finishedAt
  ? DateTime.fromISO(selectedEntry?.finishedAt).toUTC().toISO()
  : DateTime.now().toUTC().toISO();

      console.log("to updated to now", to);

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

        console.log("response getBetweeen", response);
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

  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);

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
      fromDate: todayDate,
      toDate: todayDate,
      fromTime: "00:00",
      toTime: currentTime, // or "23:59" if you want full day
      property: "Property",
      anomalyStatus: "",
    });
    setFromTime("");
    setToTime("");
  };

  const handleViewClick = (entry) => {
    if (!entry.startedAt) {
      toast.error("startedAt must be present.");
      return;
    }

    setSelectedEntry(entry);

    console.log("entry ", entry);
    console.log("entry startedAt", entry.startedAt);

    const startedAtMillis = DateTime.fromISO(entry.startedAt).toMillis();
    const finishedAtMillis = entry.finishedAt ? DateTime.fromISO(entry.finishedAt).toMillis() : DateTime.now().toMillis();
    const value = entry.archive.propertyValue;

    const data = [
      { x: startedAtMillis, y: entry.archive.propertyValue, label: "Started At" },
      { x: finishedAtMillis, y: entry.archive.propertyValue, label: "Finished At" },
    ];

    console.log("data", data);
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
    <div className="h-full w-full flex flex-col ">
      <div className="h-20 bg-gray-900 text-white p-2 top-0">
        <div className="items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center ">
          <div
            onClick={() => handleAnomalyClick("today")}
            className=" flex flex-row items-center justify-center  h-16 gap-5 bg-red-500 p-6 rounded-lg  shadow-md cursor-pointer">
           <div> <FaExclamationTriangle className="text-2xl" /></div>
            <div>
              <h3 className="text-lg font-bold  ">Today's Anomaly</h3></div>
              <p className="text-2xl font-semibold">{anomalyData.today.length}</p>
            
          </div>

          <div
            onClick={() => handleAnomalyClick("week")}
            className="flex flex-row items-center justify-center h-16 bg-blue-400 p-6 rounded-lg gap-5  shadow-md cursor-pointer">
            <div><FaCalendarWeek className="text-3xl" /></div>
            <div>
              <h3 className="text-lg font-bold">Weekly Anomaly</h3></div>
              <p className="text-2xl font-semibold">{anomalyData.week.length}</p>
            
          </div>

          <div
            onClick={() => handleAnomalyClick("month")}
            className="flex flex-row items-center justify-center h-16 bg-[#B1D5BD] p-6 rounded-lg gap-5   shadow-md cursor-pointer">
            <FaCalendarAlt className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Monthly Anomaly</h3>  </div> 
              <div><p className="text-2xl font-semibold">{anomalyData.month.length}</p></div>
          
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

       <div className="mt-2  p-0  rounded-box shadow-lg overflow-y-scroll bg-base-content max-h-147">
          <table className="table table-pin-rows">
           <thead className="sticky top-0"> 
              <tr className="bg-sky-950 text-base-200 h-10">
                <th></th>
                <th>Started At</th>
                <th>Summary</th>
                <th>Message</th>
                <th>Finished At</th>
                <th>View</th> 
              </tr>
            </thead>
            <tbody className="bg-sky-950/50 ">
              {filteredNotifications.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{formatTimestamp(entry.startedAt)}</td>
                  <td>{entry.summary}</td>
                  <td>{entry.message}</td>
                  <td>{formatTimestamp(entry.finishedAt)}</td>
                  <td>
                    <button
                      className="bg-blue-500 px-3 py-2 rounded-md text-white"
                      onClick={() => {
                        handleViewClick(entry); // Set data for the graph
                        document.getElementById("my_modal_2").showModal(); // Open modal
                      }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dialog id="my_modal_2" fixed className="modal">
          <div className="modal-box max-w-6xl w-full bg-gray-900">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">Anomaly Detection Timeline</h3>

            {/* Graph Section */}
            {graphData.length > 0 ? (
              <LineChart width={900} height={400} data={graphData} margin={{ top: 20, right: 10, left: 120, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(tick) => DateTime.fromMillis(tick).toFormat("HH:mm:ss")}
                  label={{
                    value: "Timestamp",
                    position: "insideBottom",
                    dy: 25,
                    offset: -10,
                    style: { fill: "#fff" },
                  }}
                  stroke="#ffffff"
                />
                <YAxis
                  type="number"
                  domain={[0, "dataMax + 10"]}
                  label={{
                    value: `${selectedEntry?.archive?.gensetProperty?.readablePropertyName || "Property"} (${
                      selectedEntry?.archive?.gensetProperty?.physicalQuantity?.unitSymbol || "unit"
                    })`,
                    dy: 100,
                    dx: -19,
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#fff" },
                  }}
                  stroke="#ffffff"
                />
                <Tooltip
                  formatter={(value) => `Value: ${value}`}
                  labelFormatter={(label) => `Time: ${DateTime.fromMillis(label).toFormat("HH:mm:ss")}`}
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
            ) : (
              <p className="text-red-500 text-center mt-4">No data available for graph.</p>
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-4">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default Anomalies;
