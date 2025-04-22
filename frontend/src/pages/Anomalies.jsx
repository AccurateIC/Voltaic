import { useState, useEffect } from "react";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { TransmitChannels } from "../lib/TransmitChannels";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { DateTime } from "luxon";
import { PropertyBarChart } from "./PropertyBarChart";
import { AnomaliesBarChart } from "./AnomaliesBarChart";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";

export const AnomalyStatsCard = ({ icon, title, count, onClick }) => {
  const IconComponent =
    icon === "FaExclamationTriangle" ? FaExclamationTriangle : icon === "FaCalendarWeek" ? FaCalendarWeek : FaCalendarAlt;

  return (
    <div
      onClick={onClick}
      className="flex flex-row items-center justify-center h-16 gap-5 p-6 rounded-lg shadow-md cursor-pointer"
      style={{
        backgroundColor: icon === "FaExclamationTriangle" ? "#ef4444" : icon === "FaCalendarWeek" ? "#60a5fa" : "#B1D5BD",
      }}>
      <div>
        <IconComponent className="text-2xl" />
      </div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-2xl font-semibold">{count}</p>
    </div>
  );
};

export const DateRangeFilter = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className=" flex justify-between items-center gap-4 p-2 rounded-lg">
      <div className="flex flex-row">
        <div className="flex items-center gap-4">
          <label className="text-white">From Date:</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => onFilterChange("fromDate", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
    <div
      onClick={onClick}
      className="flex flex-row items-center justify-center h-16 gap-5 p-6 rounded-lg shadow-md cursor-pointer"
      style={{
        backgroundColor: icon === "FaExclamationTriangle" ? "#ef4444" : icon === "FaCalendarWeek" ? "#60a5fa" : "#B1D5BD",
      }}>
      <div>
        <IconComponent className="text-2xl" />
      </div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-2xl font-semibold">{count}</p>
    </div>
  );
};

export const DateRangeFilter = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className=" flex justify-between items-center gap-4 p-2 rounded-lg">
      <div className="flex flex-row">
        <div className="flex items-center gap-4">
          <label className="text-white">From Date:</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => onFilterChange("fromDate", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <label className="text-white">To Date:</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onFilterChange("toDate", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-white">From Time:</label>
          <input
            type="time"
            value={filters.fromTime}
            onChange={(e) => onFilterChange("fromTime", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <label className="text-white">To Date:</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onFilterChange("toDate", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-white">From Time:</label>
          <input
            type="time"
            value={filters.fromTime}
            onChange={(e) => onFilterChange("fromTime", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />

          <label className="text-white">To Time:</label>
          <input
            type="time"
            value={filters.toTime}
            onChange={(e) => onFilterChange("toTime", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
      </div>
          <label className="text-white">To Time:</label>
          <input
            type="time"
            value={filters.toTime}
            onChange={(e) => onFilterChange("toTime", e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
        </div>
      </div>

      <div>
        <button onClick={onReset} className="btn btn-neutral">
          Reset
        </button>
      </div>
    </div>
  );
};

export const PropertyFilter = ({ gensetProperties, selectedProperties, onPropertyChange, onToggleSelectAll }) => {
  console.log("selectedProperties", selectedProperties);
  return (
    <div className="dropdown dropdown-bottom">
      <div tabIndex={0} role="button" className="btn btn-neutral w-56">
        <FaFilter className="mr-2" />
        {selectedProperties.length > 0 ? `${selectedProperties.length} Property(s) selected` : "Select Properties"}
      </div>
      <div tabIndex={0} className="dropdown-content bg-black z-[1] menu p-2 shadow rounded-box w-56">
        <div className="form-control">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={selectedProperties.length === gensetProperties.length}
              onChange={onToggleSelectAll}
            />
            <span className="label-text">Select All</span>
          </label>
        </div>
        {gensetProperties.map((property) => (
          <div key={property.id} className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={selectedProperties.includes(property.propertyName)}
                onChange={() => onPropertyChange(property.propertyName)}
              />
              <span className="label-text">{property.propertyName}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

console.log("PropertyFilter",PropertyFilter);
export const TimeRangeSelector = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="mr-2 font-medium text-sm">Time Range:</label>
      <select
        className="border border-black-300 rounded px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}>
        <option value="1d">1 Day</option>
        <option value="1w">1 Week</option>
        <option value="1m">1 Month</option>
      </select>
    </div>
  );
};

export const TimeRangeSelector1 = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="mr-2 font-medium text-sm">Time Range:</label>
      <select
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}>
        <option value="7d">1 Week</option>
        <option value="30d">1 Month</option>
      </select>
    </div>
  );
};

const AnomalyGraphModal = ({ isOpen, onClose, graphData, selectedEntry }) => {
  if (!isOpen) return null;

  return (
    <dialog id="my_modal_2" className="modal" open={isOpen}>
      <div className="modal-box max-w-6xl bg-gray-900">
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
          <form method="dialog" onClick={onClose}>
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

const AnomaliesTable = ({ data, onViewClick }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const dt = DateTime.fromISO(timestamp);
    return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  };

  return (
    <div className="mt-2 p-0 overflow-y-scroll rounded-box rounded-lg shadow-lg  bg-base-content h-[820px]">
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
        <tbody className="bg-sky-950/50">
          {data.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatTimestamp(entry.startedAt)}</td>
              <td>{entry.summary}</td>
              <td>{entry.message}</td>
              <td>{formatTimestamp(entry.finishedAt) || "N/A"}</td>
              <td>
                <button className="bg-blue-500 px-3 py-2 rounded-md text-white" onClick={() => onViewClick(entry)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Anomalies = () => {
  const [anomalyData, setAnomalyData] = useState({ today: [], week: [], month: [] });
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [archiveTimeFilter, setArchiveTimeFilter] = useState("1d");
  const [archiveTimeFilter1, setArchiveTimeFilter1] = useState("1w");
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
    property: "Property",
    anomalyStatus: "",
  });
  const [labels, setLabels] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [labels1, setLabels1] = useState([]);
  const [dataset1, setDataset1] = useState([]);

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

    return data;
  };

  const getFromToDates = (timeFilter) => {
    const now = new Date();
    let fromDate;

    if (timeFilter === "1d") {
      fromDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "1w") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "1m") {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "7d") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "30d") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      fromDate = now;
    }

    return {
      from: fromDate.toISOString(),
      to: now.toISOString(),
    };
  };

  const groupAnomalies = (anomalies, range) => {
    const today = new Date();
    const groupedData = {};
    const labels = [];

    if (range === "1d") {
      const dateKey = today.toISOString().split("T")[0];
      console.log("dateKey", dateKey);
      const count = anomalies.filter((item) => item.timestamp.startsWith(dateKey)).length;
      groupedData[dateKey] = count;
      labels.push(dateKey);
    } else if (range === "1w") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        console.log("1 week", dateKey);
        groupedData[dateKey] = 0;
      }

      anomalies.forEach((item) => {
        const dateKey = new Date(item.timestamp).toISOString().split("T")[0];
        if (groupedData.hasOwnProperty(dateKey)) {
          groupedData[dateKey]++;
        }
      });

      labels.push(...Object.keys(groupedData));
    } else if (range === "1m") {
      const weeks = [0, 0, 0, 0];
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 27); // Last 4 weeks = 28 days

      anomalies.forEach((item) => {
        const timestamp = new Date(item.timestamp);
        if (timestamp >= startDate && timestamp <= today) {
          const daysAgo = Math.floor((today - timestamp) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.floor((27 - daysAgo) / 7);
          weeks[weekIndex]++;
        }
      });

      labels.push("Week 1", "Week 2", "Week 3", "Week 4");
      for (let i = 0; i < 4; i++) {
        groupedData[`Week ${i + 1}`] = weeks[i];
      }
    }

    setLabels1(labels);
    setDataset1(Object.values(groupedData));
  };

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
      // setAnomalyData(anomalyStats);
      setFilteredNotifications(anomalyStats.today);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching notification data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnomaliesData = async (from, to) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getBetween?from=${from}&to=${to}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      const anomalies = data.filter((item) => item.isAnomaly);
      console.log("anomalies", anomalies);
console.log("PropertyFilter",PropertyFilter);
      // Step 1: Extract unique gensetProperties from anomalies
      const uniqueProperties = Array.from(
        new Map(anomalies.map((item) => [item.gensetProperty.id, item.gensetProperty])).values()
      );

      // Save to state
      setGensetProperties(uniqueProperties); // For your filter
      // setAnomalies(anomalies); // For filtering & charts

      const allPropertiesSet = new Set();
      data.forEach((item) => {
        const name = item.gensetProperty?.readablePropertyName || `Property ${item.gensetPropertyId}`;
        allPropertiesSet.add(name);
      });

      const allProperties = Array.from(allPropertiesSet);
      const anomalyCounts = {};
      allProperties.forEach((name) => {
        anomalyCounts[name] = 0;
      });

      anomalies.forEach((anomaly) => {
        const name = anomaly.gensetProperty?.readablePropertyName || `Property ${anomaly.gensetPropertyId}`;
        anomalyCounts[name]++;
      });

      const selectedProperty = filters.property;
      console.log("selectedProperty",selectedProperty);
      console.log("selectedProperty", selectedProperty);
      if (selectedProperty !== "Property" && selectedProperty) {
        setDataset([anomalyCounts[selectedProperty]]);
        console.log(dataset);
        setLabels(selectedProperty); 
      } else {
        const propertiesWithAnomalies = allProperties.filter((name) => anomalyCounts[name] > 0);
        console.log("propertiesWithAnomalies", propertiesWithAnomalies);
        setLabels(propertiesWithAnomalies);
        setDataset(propertiesWithAnomalies.map((name) => anomalyCounts[name]));
      }

      groupAnomalies(anomalies, archiveTimeFilter);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching notification data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyData = async () => {
    if (!selectedEntry) return;
    console.log("selectedEntry", selectedEntry);
    const propertyName = selectedEntry?.archive?.gensetProperty?.propertyName;
    console.log("propertyName", propertyName);
    const from = DateTime.fromISO(selectedEntry?.startedAt).toUTC().toISO();
    const to = selectedEntry?.finishedAt
      ? DateTime.fromISO(selectedEntry?.finishedAt).toUTC().toISO()
      : DateTime.now().toUTC().toISO();

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
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          from,
          to,
          properties: [propertyName],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch property data");
      }

      const data = await response.json();
      const formattedData = data.map((item) => ({
        x: new Date(item.timestamp).getTime(),
        y: item.propertyValue,
        label: "Anomaly Event",
      }));

      setGraphData(formattedData);
    } catch (error) {
      toast.error("Error fetching property data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/property/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      // if (!res.ok) throw new Error((await res.json()).message);
      const data = await res.json();
      // setGensetProperties(data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Error fetching genset property data");
    }
  };

  const handleAnomalyClick = (period) => {
    const now = DateTime.local();
    let start;
    if (period === "today") start = now.startOf("day");
    else if (period === "week") start = now.startOf("week");
    else if (period === "month") start = now.startOf("month");
    else start = now.startOf("day");

    const filtered = notifications.filter((notif) => DateTime.fromMillis(parseInt(notif.startedAt)).toLocal() >= start);
    setFilteredNotifications(filtered);
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      fromTime: "",
      toTime: "",
      property: "Property",
      anomalyStatus: "",
    });
  };

  const handleViewClick = (entry) => {
    if (!entry.startedAt) {
      toast.error("startedAt must be present.");
      return;
    }
    console.log(entry);
    console.log("entry", entry);
    setSelectedEntry(entry);
    setShowGraph(true);
  };

  const toggleSelectAll = () => {
    if (selectedProperties.length === gensetProperties.length) {
      setSelectedProperties([]);
      console.log(selectedProperties);
    } else {
      setSelectedProperties(gensetProperties.map((property) => property.propertyName));
      console.log("gensetProperties.map((property) => property.propertyName", gensetProperties);
      console.log(selectedProperties);
    }
  };

  const handlePropertyChange = (propertyName) => {
    console.log(propertyName);
    setSelectedProperties((prevSelected) =>
      prevSelected.includes(propertyName)
        ? prevSelected.filter((name) => name !== propertyName)
        : [...prevSelected, propertyName]
    );
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  // Effects
  useMessageBus(TransmitChannels.NOTIFICATION, (msg) => {
    fetchNotifications();
    fetchProperties();
  });

  useEffect(() => {
    if (gensetProperties.length > 0) {
      setSelectedProperties(gensetProperties.map((property) => property.propertyName));
    }
  }, [gensetProperties]);
  
  useEffect(() => {
    let filtered = [...notifications];

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

    if (toDateTime) {
      filtered = filtered.filter((notif) => {
        const startedAt = DateTime.fromISO(notif.startedAt);
        return startedAt <= toDateTime;
      });
    }

    if (filters.property && filters.property !== "Property") {
      filtered = filtered.filter((notif) => notif.archive.gensetProperty.propertyName === filters.property);
    }

    setFilteredNotifications(filtered);
  }, [filters, notifications]);

  useEffect(() => {
    const { from, to } = getFromToDates(archiveTimeFilter);
    fetchAnomaliesData(from, to);
  }, [archiveTimeFilter]);

  useEffect(() => {
    fetchPropertyData();
  }, [selectedEntry]);

  useEffect(() => {
    fetchNotifications();
    fetchProperties();
  }, []);

  return (
    <div className={`h-full w-full flex flex-col transition-all duration-300 ${showGraph ? "backdrop-blur-sm" : ""}`}>
      <div className="h-20 bg-gray-900 text-white p-2 top-0">
        {/* Stats Cards */}
        <div className="items-center grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
          <AnomalyStatsCard
            icon="FaExclamationTriangle"
            title="Today's Anomaly"
            count={anomalyData.today.length}
            onClick={() => handleAnomalyClick("today")}
          />
          <AnomalyStatsCard
            icon="FaCalendarWeek"
            title="Weekly Anomaly"
            count={anomalyData.week.length}
            onClick={() => handleAnomalyClick("week")}
          />
          <AnomalyStatsCard
            icon="FaCalendarAlt"
            title="Monthly Anomaly"
            count={anomalyData.month.length}
            onClick={() => handleAnomalyClick("month")}
          />
        </div>

        {/* Filters */}

        <div className="flex items-center mt-4 gap-120 py-2">
          <div className=" flex gap-4 ">
            <div className="font-semibold text-md">Properties: </div>
            <PropertyFilter
              gensetProperties={gensetProperties}
              selectedProperties={selectedProperties}
              onPropertyChange={handlePropertyChange}
              onToggleSelectAll={toggleSelectAll}
            />
            <TimeRangeSelector value={archiveTimeFilter} onChange={setArchiveTimeFilter} />
          </div>

          <div>
            {" "}
            <DateRangeFilter filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
          </div>
        </div>

        <div className="flex h-[540px] gap-1">
          {/* First Column: Two stacked charts */}
          <div className="flex flex-col  gap-2 h-[440px] w-[1000px]">
            <PropertyBarChart labels={selectedProperties} dataset={dataset} selected={selectedProperties} />
            <AnomaliesBarChart labels={labels1} dataset={dataset1}  />
          </div>

          {/* Second Column: Table takes full height of chart column */}
          <div className="w-1/2 h-full ">
            {/* Optional filter */}
            <AnomaliesTable data={filteredNotifications} onViewClick={handleViewClick} />
          </div>
        </div>

        {/* Graph Modal */}
        <AnomalyGraphModal
          isOpen={showGraph}
          onClose={() => setShowGraph(false)}
          graphData={graphData}
          selectedEntry={selectedEntry}
        />
      </div>
      {/* Graph Modal */}
      <AnomalyGraphModal
        isOpen={showGraph}
        onClose={() => setShowGraph(false)}
        graphData={graphData}
        selectedEntry={selectedEntry}
      />
    </div>
  );
};

export default Anomalies;
