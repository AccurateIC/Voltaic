import { useState, useEffect } from "react";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { TransmitChannels } from "../lib/TransmitChannels";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { DateTime } from "luxon";
import { PropertyBarChart } from "../components/charts/PropertyBarChart";
import { AnomaliesBarChart } from "../components/charts/AnomaliesBarChart";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import AnomaliesLineChart from "../components/charts/AnomaliesLineChart";
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
            className="p-2 rounded bg-base-200 text-base-content border"
          />

          <label className="text-white">To Date:</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onFilterChange("toDate", e.target.value)}
            className="p-2 rounded bg-base-200 text-base-content border"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-white">From Time:</label>
          <input
            type="time"
            value={filters.fromTime}
            onChange={(e) => onFilterChange("fromTime", e.target.value)}
            className="p-2 rounded bg-base-200 text-base-content border"
          />

          <label className="text-white">To Time:</label>
          <input
            type="time"
            value={filters.toTime}
            onChange={(e) => onFilterChange("toTime", e.target.value)}
            className="p-2 rounded bg-base-200 text-base-content border"
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
  return (
    <div className="dropdown dropdown-bottom">
      <div tabIndex={0} role="button" className="btn btn-neutral w-56 bg-base-200">
        <FaFilter className="mr-2" />
        {selectedProperties.length > 0 ? `${selectedProperties.length} Property(s) selected` : "Select Properties"}
      </div>
      <div tabIndex={0} className="dropdown-content bg-base-200 z-[1] menu p-2 shadow rounded-box w-56">
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

export const TimeRangeSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <label className="">Time Range:</label>
      <select
        className="border border-black-300 rounded px-2 py-1 text-sm bg-base-200"
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
      <div className="modal-box max-w-6xl bg-base-200">
        <h3 className="text-base-content text-xl font-semibold mb-4 text-center">Anomaly Detection Timeline</h3>

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
          <p className="text-error text-center mt-4">No data available for graph.</p>
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
    <div className="overflow-y-auto w-full bg-base-100 text-base-content p-0 rounded-box rounded-lg shadow-lg h-full">
      <table className="table table-pin-rows">
        <thead className="sticky top-0">
          <tr className="bg-base-100 text-base-content">
            <th></th>
            <th>Started At</th>
            <th>Summary</th>
            <th>Message</th>
            <th>Finished At</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody className="bg-base-200 h-full">
          {data.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{formatTimestamp(entry.startedAt)}</td>
              <td>{entry.summary}</td>
              <td>{entry.message}</td>
              <td>{formatTimestamp(entry.finishedAt) || "N/A"}</td>
              <td>
                <button className="btn btn-primary" onClick={() => onViewClick(entry)}>
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
  const [anomalies, setAnomalies] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [archiveTimeFilter, setArchiveTimeFilter] = useState("1m");
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
      // Start of today (12:00 AM)
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === "1w") {
      // Start of this week (Monday)
      fromDate = new Date(now);
      const day = fromDate.getDay(); // 0 = Sunday, 1 = Monday, ...
      const diff = day === 0 ? 6 : day - 1; // Adjust if today is Sunday
      fromDate.setDate(fromDate.getDate() - diff);
      fromDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === "1m") {
      // Start of this month
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else if (timeFilter === "7d") {
      // Last 7 days from now
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "30d") {
      // Last 30 days from now
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      fromDate = now;
    }

    return {
      from: fromDate.toISOString(),
      to: now.toISOString(),
    };
  };

  const groupAnomalies = (filteredAnomalies, range) => {
    const today = new Date();
    const groupedData = {};
    const labels = [];

    if (range === "1d") {
      // Today's date
      const dateKey = today.toISOString().split("T")[0];
      const count = filteredAnomalies.filter((item) => item.timestamp.startsWith(dateKey)).length;
      groupedData[dateKey] = count;
      labels.push(dateKey);
    } else if (range === "1w") {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
      const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days; else, go to Monday
      startOfWeek.setDate(today.getDate() + diff);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        // ✅ Skip future dates
        if (date > today) break;

        const dateKey = date.toISOString().split("T")[0];
        groupedData[dateKey] = 0;
        labels.push(dateKey);
      }

      filteredAnomalies.forEach((item) => {
        const dateKey = new Date(item.timestamp).toISOString().split("T")[0];
        if (groupedData.hasOwnProperty(dateKey)) {
          groupedData[dateKey]++;
        }
      });
    } else if (range === "1m") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const weeks = [];

      let currentStart = new Date(startOfMonth);

      while (currentStart <= today) {
        const currentEnd = new Date(currentStart);
        currentEnd.setDate(currentStart.getDate() + 6);

        // Prevent currentEnd from going beyond today
        if (currentEnd > today) {
          currentEnd.setTime(today.getTime());
        }

        weeks.push({
          start: new Date(currentStart),
          end: new Date(currentEnd),
          count: 0,
        });

        // Move to next week
        currentStart.setDate(currentStart.getDate() + 7);
      }

      // Count anomalies in each week range
      filteredAnomalies.forEach((item) => {
        const timestamp = new Date(item.timestamp);
        for (let i = 0; i < weeks.length; i++) {
          if (timestamp >= weeks[i].start && timestamp <= weeks[i].end) {
            weeks[i].count++;
            break;
          }
        }
      });

      // Format labels and fill groupedData
      weeks.forEach((week) => {
        const label = `${week.start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${week.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        labels.push(label);
        groupedData[label] = week.count;
      });
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
      console.log(anomalyStats);
      setAnomalyData(anomalyStats);

      setFilteredNotifications(anomalyStats.today);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching notification data");
    } finally {
      setIsLoading(false);
    }
  };

  const [lineEngFuleLavel, setLineEngFulLavel] = useState([]);
  const [engSpeedDisplay, setEngSpeedDisplay] = useState([]);
  const [engOilPress, setEngOilPress] = useState([]);
  const [genL1Current, setGenL1Volts] = useState([]);
  const [genTotalVA, setGenTotalVA] = useState([]);

  const fetchAnomaliesDatas = async (from, to, selectedProperties) => {
    console.log(selectedProperties);
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getPropertyDataBetween`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          from,
          to,
          properties: selectedProperties, // pass array properly
        }),
      });

      const data = await response.json();
      console.log(data);
      // ⚡ Always reset all graphs first
      setLineEngFulLavel([]);
      setEngSpeedDisplay([]);
      setEngOilPress([]);
      setGenL1Volts([]);
      setGenTotalVA([]);

      // Filter and set the data for each property dynamically
      selectedProperties.forEach((property) => {
        const filteredData = data.filter((item) => item.gensetProperty.propertyName === property);

        // Dynamically set the corresponding state for each property
        switch (property) {
          case "genTotalVA":
            setGenTotalVA(filteredData);
            break;
          case "engFuelLevelUnits":
            setLineEngFulLavel(filteredData);
            break;
          case "engSpeedDisplay":
            setEngSpeedDisplay(filteredData);
            break;
          case "engOilPress":
            setEngOilPress(filteredData);
            break;
          case "genL1Current":
            setGenL1Volts(filteredData);
            break;
          default:
            break;
        }
      });

      return data; // return data to be used elsewhere
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

      // Extract unique gensetProperties from anomalies
      const uniqueProperties = Array.from(
        new Map(anomalies.map((item) => [item.gensetProperty.id, item.gensetProperty])).values()
      );
      setGensetProperties(uniqueProperties);
      setAnomalies(anomalies);

      // filter anomalies based on selected properties
      const filteredAnomalies =
        selectedProperties.length > 0
          ? anomalies.filter((item) => selectedProperties.includes(item.gensetProperty.propertyName))
          : anomalies;

      // property bar chart data
      const allPropertiesSet = new Set();
      filteredAnomalies.forEach((item) => {
        const name = item.gensetProperty.readablePropertyName;
        allPropertiesSet.add(name);
      });

      const allProperties = Array.from(allPropertiesSet);
      const anomalyCounts = {};
      allProperties.forEach((name) => {
        anomalyCounts[name] = 0;
      });

      filteredAnomalies.forEach((anomaly) => {
        const name = anomaly.gensetProperty.readablePropertyName;
        anomalyCounts[name]++;
      });

      const propertiesWithAnomalies = allProperties.filter((name) => anomalyCounts[name] > 0);
      setLabels(propertiesWithAnomalies);
      setDataset(propertiesWithAnomalies.map((name) => anomalyCounts[name]));

      groupAnomalies(filteredAnomalies, archiveTimeFilter);
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
    // console.log("propertyName", propertyName);
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
      if (!res.ok) throw new Error((await res.json()).message);
      const data = await res.json();
      // setGensetProperties(data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Error fetching genset property data");
    }
  };

  const handleViewClick = (entry) => {
    if (!entry.startedAt) {
      toast.error("startedAt must be present.");
      return;
    }
    setSelectedEntry(entry);
    setShowGraph(true);
  };

  const handlePropertyChange = (propertyName) => {
    setSelectedProperties((prev) =>
      prev.includes(propertyName) ? prev.filter((p) => p !== propertyName) : [...prev, propertyName]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProperties.length === gensetProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(gensetProperties.map((p) => p.propertyName));
    }
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

    // Filter by selected properties
    if (selectedProperties.length > 0) {
      filtered = filtered.filter((notif) => selectedProperties.includes(notif.archive?.gensetProperty?.propertyName));
    }

    setFilteredNotifications(filtered);
  }, [filters, notifications, selectedProperties]);

  useEffect(() => {
    const { from, to } = getFromToDates(archiveTimeFilter);
    console.log(from, to);
    fetchAnomaliesData(from, to);
  }, [archiveTimeFilter, selectedProperties]);

  useEffect(() => {
    const { from, to } = getFromToDates(archiveTimeFilter);
    fetchAnomaliesDatas(from, to, selectedProperties);
  }, [archiveTimeFilter, selectedProperties]);

  useEffect(() => {
    fetchPropertyData();
  }, [selectedEntry]);

  useEffect(() => {
    fetchNotifications();
    fetchProperties();
  }, []);
  const allCharts = [lineEngFuleLavel, engSpeedDisplay, engOilPress, genL1Current, genTotalVA];

  return (
    <div
      className={` bg-base-300 text-base-content p-2 top-0 h-full w-full flex flex-col transition-all duration-300 overflow-y-auto ${
        showGraph ? "backdrop-blur-sm" : ""
      }`}>
      {/* Stats Cards */}
      <div className="items-center text-base-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center ">
        <AnomalyStatsCard icon="FaExclamationTriangle" title="Today's Anomalies" count={anomalyData.today.length} />
        <AnomalyStatsCard icon="FaCalendarWeek" title="Weekly Anomalies" count={anomalyData.week.length} />
        <AnomalyStatsCard
          icon="FaCalendarAlt"
          title="Monthly Anomalies"
          count={anomalyData.month.length}
          onClick={() => handleAnomalyClick("month")}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center py-2 ">
        <div className="flex gap-4 ">
          <div className="font-semibold text-md">Properties: </div>
          <PropertyFilter
            gensetProperties={gensetProperties}
            selectedProperties={selectedProperties}
            onPropertyChange={handlePropertyChange}
            onToggleSelectAll={toggleSelectAll}
          />
          <TimeRangeSelector value={archiveTimeFilter} onChange={setArchiveTimeFilter} />
        </div>
      </div>
      <div className="flex flex-row gap-2 h-full">
        {/* First Column: Two stacked charts */}
        <div className="flex flex-col gap-4 w-1/2">
          <div className="h-1/2 bg-base-200 rounded p-5">
            <PropertyBarChart labels={labels} dataset={dataset} />
          </div>
          <div className="h-1/2 bg-base-200 rounded p-5">
            <AnomaliesBarChart labels={labels1} dataset={dataset1} />
          </div>
        </div>

        {/* Second Column: Match height of left column */}
        <div className="flex flex-col gap-14 w-1/2 h-full">
          <div className="flex-1  overflow-auto">
            <AnomaliesTable data={filteredNotifications} onViewClick={handleViewClick} />
          </div>
          {genTotalVA.length > 0 && (
            <div className="flex-1 bg-base-200 rounded p-5 h-full">
              <AnomaliesLineChart value={genTotalVA} />
            </div>
          )}
        </div>
      </div>

      {/* Graph Modal */}
      <AnomalyGraphModal
        isOpen={showGraph}
        onClose={() => setShowGraph(false)}
        graphData={graphData}
        selectedEntry={selectedEntry}
      />
      <div className="flex flex-col  gap-3 ">
        {/* Row 1 */}
        {(lineEngFuleLavel.length > 0 || engSpeedDisplay.length > 0) && (
          <div className="flex mt-5 gap-3  ">
            {/* Row 1 */}
            {lineEngFuleLavel.length > 0 && <AnomaliesLineChart value={lineEngFuleLavel} />}
            {engSpeedDisplay.length > 0 && <AnomaliesLineChart value={engSpeedDisplay} />}
          </div>
        )}

        {/* Row 2 */}
        {(engOilPress.length > 0 || genL1Current.length > 0) && (
          <div className="flex  gap-3 ">
            {engOilPress.length > 0 && <AnomaliesLineChart value={engOilPress} />}
            {genL1Current.length > 0 && <AnomaliesLineChart value={genL1Current} />}
          </div>
        )}
      </div>

      {/*     <div className="flex flex-col mt-5 gap-6">
  {Array.from({ length: Math.ceil(allCharts.length / 2) }, (_, i) => (
    <div key={i} className="flex gap-4">
      {allCharts.slice(i * 2, i * 2 + 2).map((chartData, j) => (
        chartData.length > 0 && (
          <AnomaliesLineChart key={j} value={chartData} />
        )
      ))}
    </div>
  ))}
</div> */}
    </div>
  );
};

export default Anomalies;
