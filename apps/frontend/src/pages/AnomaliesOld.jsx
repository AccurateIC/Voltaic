/**
 * Legacy anomalies UI (route `anomalies-old`). Uses notification/archive-specific
 * endpoints; the main `Anomalies` page uses shared React Query keys + `getAnomalyStatistics`.
 */
import { useState, useEffect, useRef } from "react";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { TransmitChannels } from "../lib/TransmitChannels";

import { DateTime } from "luxon";
import { PropertyBarChart } from "../components/charts/PropertyBarChart";
import { AnomaliesBarChart } from "../components/charts/AnomaliesBarChart";
import { FaExclamationTriangle, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import AnomaliesLineChart from "../components/charts/AnomaliesLineChart";
import { FaFilter } from "react-icons/fa";
import AnomalyGraphModal from "../components/charts/AnomalyGraphModal";
import { formatTimestamp } from "../lib/Utils";
import { tuyau } from "../lib/Tuyau";
import Skeleton from "../components/Skeleton";
import DynamicTable from "../components/DynamicTable";
import SelectAllCheckboxPopup from "../components/SelectAllCheckboxPopup";
import { BACKEND_BASE_URL } from "../config/backend";
export const AnomalyStatsCard = ({ icon, title, count, onClick }) => {
  const IconComponent =
    icon === "FaExclamationTriangle"
      ? FaExclamationTriangle
      : icon === "FaCalendarWeek"
        ? FaCalendarWeek
        : FaCalendarAlt;

  return (
    <div
      onClick={onClick}
      className="flex flex-row items-center justify-center h-16 gap-5 p-6 rounded-lg shadow-md cursor-pointer sm:h-20 sm:gap-6 sm:p-8"
      style={{
        backgroundColor:
          icon === "FaExclamationTriangle" ? "#ef4444" : icon === "FaCalendarWeek" ? "#60a5fa" : "#B1D5BD",
      }}
    >
      <div>
        <IconComponent className="text-2xl sm:text-3xl" />
      </div>
      <div>
        <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
      </div>
      <p className="text-2xl font-semibold sm:text-3xl">{count}</p>
    </div>
  );
};

export const TimeRangeSelector = ({ value, onChange }) => {
  const timeRangeOptions = [
    { value: "1d", label: "1 Day" },
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
  ];

  return (
    <div className="flex flex-row items-center gap-2 sm:gap-3">
      <label className="text-sm sm:text-base font-medium text-base-content/80">Time Range:</label>
      <div className="dropdown dropdown-end">
        <button
          type="button"
          tabIndex={0}
          className="btn btn-sm btn-outline min-w-[112px] justify-between bg-base-100 normal-case font-medium"
        >
          {timeRangeOptions.find((option) => option.value === value)?.label ?? "1 Month"}
          <span className="text-xs opacity-70">▼</span>
        </button>
        <ul tabIndex={0} className="dropdown-content menu p-1 mt-1 shadow-xl bg-base-100 rounded-box w-36 z-[70]">
          {timeRangeOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={value === option.value ? "active" : ""}
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const PropertyFilter = ({ gensetProperties, selectedProperties, onPropertyChange, onToggleSelectAll }) => {
  return (
    <SelectAllCheckboxPopup
      trigger={
        <button type="button" tabIndex={0} className="btn btn-sm w-48 text-xs sm:btn-md sm:w-56 sm:text-base">
          <FaFilter className="mr-1 sm:mr-2" />
          {selectedProperties.length > 0 ? `${selectedProperties.length} Props` : "Properties"}
        </button>
      }
      widthClassName="w-[min(90vw,24rem)] max-w-[24rem]"
      selectAllChecked={gensetProperties.length > 0 && selectedProperties.length === gensetProperties.length}
      onToggleSelectAll={onToggleSelectAll}
      options={gensetProperties.map((property) => ({
        value: property.propertyName,
        label: property.readablePropertyName,
      }))}
      getOptionChecked={(value) => selectedProperties.includes(value)}
      onToggleOption={(value) => onPropertyChange(value)}
    />
  );
};

const AnomaliesTable = ({
  data,
  onViewClick,
  onResolveClick,
  resolvingId,
  isResolvingAll,
  startIndex,
  currentPage,
  totalPages,
  totalRecords,
  itemsPerPage,
  onPageChange,
}) => {
  const columns = [
    {
      key: "srNo",
      header: "S.No.",
      cell: (_, rowIndex) => <span className="text-xs sm:text-base">{startIndex + rowIndex}</span>,
    },
    {
      key: "startedAt",
      header: "Started At",
      cell: (row) => <span className="text-xs sm:text-base">{formatTimestamp(row.startedAt)}</span>,
    },
    {
      key: "summary",
      header: "Summary",
      cell: (row) => <span className="text-xs sm:text-base">{row.summary}</span>,
    },
    {
      key: "message",
      header: "Message",
      cell: (row) => <span className="text-xs sm:text-base">{row.message}</span>,
    },
    {
      key: "finishedAt",
      header: "Finished At",
      cell: (row) => <span className="text-xs sm:text-base">{formatTimestamp(row.finishedAt) || "N/A"}</span>,
    },
    {
      key: "view",
      header: "View",
      cell: (row) => (
        <button className="btn btn-outline btn-xs sm:btn-sm" onClick={() => onViewClick(row)}>
          View
        </button>
      ),
    },
    {
      key: "resolve",
      header: "Resolve",
      cell: (row) => (
        <button
          className={
            "btn btn-outline btn-xs sm:btn-sm " +
            (resolvingId === row.id || isResolvingAll ? "btn-disabled" : row.shouldBeDisplayed ? "btn-info" : "btn-disabled")
          }
          onClick={() => onResolveClick(row.id)}
          disabled={resolvingId === row.id || isResolvingAll || !row.shouldBeDisplayed}
        >
          {resolvingId === row.id ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Resolving...
            </>
          ) : row.shouldBeDisplayed ? (
            "Resolve"
          ) : (
            "Resolved"
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="h-full">
      <DynamicTable
        title="Anomalies"
        columns={columns}
        data={data}
        getRowId={(row, idx) => String(row.id ?? row.startedAt ?? `${idx}`)}
        emptyContent={<div className="p-4 text-sm text-base-content/70">No anomalies found for selected filters.</div>}
        pagination={{
          currentPage,
          totalPages,
          totalRecords,
          itemsPerPage,
          onPageChange,
          isLoading: isResolvingAll,
        }}
      />
    </div>
  );
};

const Anomalies = () => {
const [anomalyData, setAnomalyData] = useState({
  today: 0,
  week: 0,
  month: 0,
});
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);
 const [notifications, setNotifications] = useState([]);
const [notificationCounts, setNotificationCounts] = useState({
  anomaly: 0,
  maintenance: 0,
});
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
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
  const [timeRange, setTimeRange] = useState("1d");
  const [loadAllData, setLoadAllData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("chart1");
  const [resolvingId, setResolvingId] = useState(null);
  const [isResolvingAll, setIsResolvingAll] = useState(false);
  const [resolveProgress, setResolveProgress] = useState(0);
  const [lineEngFuleLavel, setLineEngFulLavel] = useState([]);
  const [engSpeedDisplay, setEngSpeedDisplay] = useState([]);
  const [engOilPress, setEngOilPress] = useState([]);
  const [genL1Current, setGenL1Volts] = useState([]);
  const [genTotalVA, setGenTotalVA] = useState([]);
  const realtimeNotificationTimeoutRef = useRef(null);

  const getAnomalyDataByPeriod = (notificationsList) => {
    const now = DateTime.local();
    const todayStr = now.toISODate();
    const weekStart = now.startOf("week");
    const monthStart = now.startOf("month");
    const data = { today: [], week: [], month: [] };
    notificationsList.forEach((notif) => {
      const notifTime = DateTime.fromISO(notif.startedAt);
      if (notifTime >= monthStart) {
        data.month.push(notif);
        if (notifTime >= weekStart) {
          data.week.push(notif);
        }
      }
      if (notifTime.toISODate() === todayStr) {
        data.today.push(notif);
      }
    });
    return data;
  };

  function groupAnomalies(data) {
    const counts = {};
    data.forEach((item) => {
      const time = item.startedAt || item.timestamp;
      if (!time) return;
      const date = DateTime.fromISO(time).toISODate();
      counts[date] = (counts[date] || 0) + 1;
    });
    const labelsList = Object.keys(counts).sort();
    const datasetList = labelsList.map((label) => counts[label]);
    setLabels1(labelsList);
    setDataset1(datasetList);
  }

  const processChartDataFromNotifications = (notificationsList) => {
    if (!notificationsList || notificationsList.length === 0) return;
    const counts = {};
    notificationsList.forEach((notif) => {
      const prop =
        notif?.archive?.gensetProperty?.readablePropertyName ||
        notif?.propertyName ||
        "Unknown";
      if (!prop) return;
      counts[prop] = (counts[prop] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    setLabels(labels);
    setDataset(data);
  };
  const fetchNotifications = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      const { data, error } = await tuyau.notification.paginate.$get({
        query: { page, limit: 50, includeResolved: false },
      });

      if (error) throw new Error(error.message || "Failed to fetch notification data");

      const notificationsArray = data.data || [];
      setNotifications(notificationsArray);
      setPaginationInfo(data.pagination);
      setCurrentPage(data?.pagination?.page || page);
    } catch (error) {
      toast.error("Error fetching notification data");
    } finally {
      if (showLoading) setIsLoading(false);
      setIsInitialLoading(false);
    }
  };
  const fetchAnomalyStatsCount = async () => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/notification/anomalyStatsCount`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    setAnomalyData({
      today: data?.today || 0,
      week: data?.week || 0,
      month: data?.month || 0,
    });
  } catch (error) {
    console.error("Failed to fetch anomaly stats count:", error);
  }
};
  const fetchNotificationCount = async () => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/notification/count`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    setNotificationCounts({
      anomaly: data?.anomaly || 0,
      maintenance: data?.maintenance || 0,
    });
  } catch (error) {
    console.error("Failed to fetch notification count:", error);
  }
};

  const fetchAnomaliesDatas = async (from, to, selectedPropertiesList, showLoading = true) => {
    // Important: when the user deselects all properties, clear chart series too.
    // Otherwise previously fetched chart data stays visible even though selection is empty.
    if (selectedPropertiesList.length === 0) {
    setLineEngFulLavel([]);
      setEngSpeedDisplay([]);
      setEngOilPress([]);
      setGenL1Volts([]);
      setGenTotalVA([]);
      return;
    }
    try {
      if (showLoading) setIsLoading(true);
      const { data, error } = await tuyau.archive.getPropertyDataBetween.$post({
        from,
        to,
        properties: selectedPropertiesList,
      });
      if (error) throw new Error("Failed to fetch anomalies data");
      setLineEngFulLavel([]);
      setEngSpeedDisplay([]);
      setEngOilPress([]);
      setGenL1Volts([]);
      setGenTotalVA([]);
      selectedPropertiesList.forEach((property) => {
        const filteredData = data.filter((item) => item.gensetProperty.propertyName === property);
        switch (property) {
          case "genTotalVA": setGenTotalVA(filteredData); break;
          case "engFuelLevelUnits": setLineEngFulLavel(filteredData); break;
          case "engSpeedDisplay": setEngSpeedDisplay(filteredData); break;
          case "engOilPress": setEngOilPress(filteredData); break;
          case "genL1Current": setGenL1Volts(filteredData); break;
          default: break;
        }
      });
      return data;
    } catch (error) {
      toast.error("Error fetching property data");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const fetchAnomaliesData = async (from, to, showLoading = true) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      if (showLoading) setIsLoading(true);
      const response = await fetch(
        `${BACKEND_BASE_URL}/archive/getBetween?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&loadAll=false`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(20000),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      let archiveArray = [];
      if (data && (Array.isArray(data) || (data.data && Array.isArray(data.data)))) {
        archiveArray = Array.isArray(data) ? data : data.data;
      }
      archiveArray = archiveArray.slice(0, 50);
      if (archiveArray.length === 0) return;
      await processAnomalyData(archiveArray);
    } catch (error) {
      if (loadAllData) setLoadAllData(false);
    } finally {
      if (showLoading) setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const processAnomalyData = async (archiveArray) => {
    setAnomalies(archiveArray);
  };

  const fetchPropertyData = async () => {
    if (!selectedEntry) return;
    const propertyName = selectedEntry?.archive?.gensetProperty?.propertyName;
    const from = DateTime.fromISO(selectedEntry?.startedAt).toUTC().toISO();
    const to = selectedEntry?.finishedAt
      ? DateTime.fromISO(selectedEntry?.finishedAt).toUTC().toISO()
      : DateTime.now().toUTC().toISO();
    if (!propertyName || !from || !to) {
      toast.error("Incomplete data for fetching property info");
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await tuyau.archive.getPropertyDataBetween.$post({
        from,
        to,
        properties: [propertyName],
      });
      if (error) throw new Error(error.message || "Failed to fetch property data");
      const formattedData = data.map((item) => ({
        x: DateTime.fromISO(item.startedAt),
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
const handleResolveAnomalies = async (notificationId) => {
  try {
    setResolvingId(notificationId);
    const { data, error } = await tuyau.notification.read[notificationId].$patch();

    if (!error) {
      toast.success("Anomaly resolved!");

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setPaginationInfo((prev) =>
        prev
          ? {
              ...prev,
              total: Math.max(0, (prev.total || 0) - 1),
              pages: Math.max(1, Math.ceil(Math.max(0, (prev.total || 0) - 1) / (prev.limit || 50))),
            }
          : prev
      );

      fetchNotificationCount();
      fetchAnomalyStatsCount();
    } else {
      toast.error("Failed to resolve anomaly");
    }
  } catch (error) {
    toast.error(`Error: ${error?.message}`);
  } finally {
    setResolvingId(null);
  }
};
const handleResolveAll = async () => {
  const unresolvedAnomalies = notifications.filter((notif) => notif.shouldBeDisplayed);

  if (unresolvedAnomalies.length === 0) {
    toast.info("No unresolved anomalies to resolve");
    return;
  }

  toast.dismiss();
  setIsResolvingAll(true);
  setResolveProgress(0);

  const toastId = "resolve-all-toast";
  toast.loading(`Resolving ${unresolvedAnomalies.length} anomalies...`, { id: toastId });

  try {
    const notificationIds = unresolvedAnomalies.map((n) => n.id);

    const response = await fetch(`${BACKEND_BASE_URL}/notification/resolveMultiple`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ notificationIds }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || "Failed to resolve anomalies");

    setResolveProgress(100);

    setNotifications((prev) => prev.filter((n) => !notificationIds.includes(n.id)));

    if (result?.newCounts) {
      setNotificationCounts({
        anomaly: result.newCounts.anomaly || 0,
        maintenance: result.newCounts.maintenance || 0,
      });
    } else {
      fetchNotificationCount();
    }
    fetchAnomalyStatsCount();
    fetchNotifications(currentPage, false);

    toast.dismiss();
    toast.success(`Successfully resolved ${result.resolved} anomalies!`, { duration: 2000 });
  } catch (error) {
    toast.dismiss();
    toast.error(error?.message || "Error resolving anomalies", { duration: 3000 });
  } finally {
    setIsResolvingAll(false);
    setResolveProgress(0);
  }
};

useMessageBus(TransmitChannels.NOTIFICATION, () => {
  if (realtimeNotificationTimeoutRef.current) return;
  realtimeNotificationTimeoutRef.current = setTimeout(() => {
    fetchNotifications(currentPage, false);
    realtimeNotificationTimeoutRef.current = null;
  }, 300);
  fetchNotificationCount();
  fetchAnomalyStatsCount();
});

  useMessageBus(TransmitChannels.ARCHIVE, (newArchive) => {
    if (!newArchive || isFetchingRef.current) return;
  });

useEffect(() => {
  fetchNotifications(1);
  fetchNotificationCount();
  fetchAnomalyStatsCount();
}, []);

useEffect(() => {
  return () => {
    if (realtimeNotificationTimeoutRef.current) {
      clearTimeout(realtimeNotificationTimeoutRef.current);
    }
  };
}, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const to = new Date().toISOString();
      let fromDate;
      switch (timeRange) {
        case "1d": fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
        case "1w": fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
        case "1m": fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); break;
        default: fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }
      const fetchFrom = loadAllData ? new Date(0).toISOString() : fromDate.toISOString();
      fetchAnomaliesData(fetchFrom, to);
      fetchAnomaliesDatas(fetchFrom, to, selectedProperties);
    }, 100);
    return () => clearTimeout(timer);
  }, [timeRange, loadAllData, selectedProperties]);

  useEffect(() => {
    let filtered = [...notifications];
    let fromDateTime = null;
    let toDateTime = null;
    if (filters.fromDate && filters.fromTime) {
      fromDateTime = DateTime.fromISO(`${filters.fromDate}T${filters.fromTime}`);
    } else if (timeRange) {
      const now = DateTime.local();
      if (timeRange === "1d") fromDateTime = now.minus({ hours: 24 });
      if (timeRange === "1w") fromDateTime = now.minus({ days: 7 });
      if (timeRange === "1m") fromDateTime = now.minus({ days: 30 });
    }
    if (filters.toDate && filters.toTime) toDateTime = DateTime.fromISO(`${filters.toDate}T${filters.toTime}`);
    if (fromDateTime) filtered = filtered.filter((notif) => DateTime.fromISO(notif.startedAt) >= fromDateTime);
    if (toDateTime) filtered = filtered.filter((notif) => DateTime.fromISO(notif.startedAt) <= toDateTime);
    if (filters.property && filters.property !== "Property") {
      filtered = filtered.filter((notif) => notif.archive?.gensetProperty?.propertyName === filters.property);
    }

    // Update dropdown options from the time-filtered notifications,
    // independent of `selectedProperties` (so deselecting doesn't shrink options to only "Select All").
    const propertyMap = new Map();
    filtered.forEach((notif) => {
      const prop = notif?.archive?.gensetProperty;
      const propertyName = prop?.propertyName;
      if (!propertyName) return;
      if (!propertyMap.has(propertyName)) {
        propertyMap.set(propertyName, {
          id: prop?.id ?? propertyName,
          propertyName,
          readablePropertyName: prop?.readablePropertyName ?? propertyName,
        });
      }
    });

    const nextGensetProperties = Array.from(propertyMap.values()).sort((a, b) =>
      String(a.propertyName).localeCompare(String(b.propertyName))
    );
    setGensetProperties((prev) => {
      const prevNames = prev.map((p) => p.propertyName).join("|");
      const nextNames = nextGensetProperties.map((p) => p.propertyName).join("|");
      return prevNames === nextNames ? prev : nextGensetProperties;
    });

    if (selectedProperties.length > 0) {
      filtered = filtered.filter((notif) => selectedProperties.includes(notif.archive?.gensetProperty?.propertyName));
    }
    processChartDataFromNotifications(filtered);
    groupAnomalies(filtered);
  }, [filters, notifications, selectedProperties, timeRange]);

  useEffect(() => {
    fetchPropertyData();
  }, [selectedEntry]);

 const unresolvedCount = notificationCounts.anomaly;

const itemsPerPage = 50;
const totalRecords = paginationInfo?.total || 0;
const totalPages = paginationInfo?.pages || Math.max(1, Math.ceil(totalRecords / itemsPerPage));
const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
const currentNotifications = notifications; // already only current page from backend
  const getLineSeriesForProperty = (propertyName) => {
    switch (propertyName) {
      case "engFuelLevelUnits":
        return lineEngFuleLavel;
      case "engSpeedDisplay":
        return engSpeedDisplay;
      case "engOilPress":
        return engOilPress;
      case "genL1Current":
        return genL1Current;
      case "genTotalVA":
        return genTotalVA;
      default:
        return [];
    }
  };

 

  return (
    <div className="bg-base-300 text-base-content h-full w-full flex flex-col gap-3 overflow-x-hidden">

     {isInitialLoading ? (
  <div className="flex flex-col gap-4 w-full h-full p-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <Skeleton type="stat" />
      <Skeleton type="stat" />
      <Skeleton type="stat" />
    </div>
    <div className="flex flex-col md:flex-row gap-4 h-[400px]">
      <div className="flex flex-col w-full md:w-1/2 gap-4">
        <Skeleton type="chart" />
        <Skeleton type="chart" />
      </div>
      <div className="w-full md:w-1/2 h-full">
        <Skeleton type="table" rows={8} columns={6} />
      </div>
    </div>
  </div>
) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight text-base-content">Anomalies</h1>
          </div>
          {/* Stats Cards */}
          <div className="items-center text-base-200 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center sm:mb-4 mb-3">
          <AnomalyStatsCard icon="FaExclamationTriangle" title="Today's Anomaly" count={anomalyData.today} />
<AnomalyStatsCard icon="FaCalendarWeek" title="Weekly Anomaly" count={anomalyData.week} />
<AnomalyStatsCard icon="FaCalendarAlt" title="Monthly Anomaly" count={anomalyData.month} />
          </div>

          {/* Filters & Resolve Button */}
          <div className="flex items-center py-2 flex-wrap justify-end gap-2 sm:gap-4 sm:py-3">
            <div className="flex gap-2 sm:gap-4 items-center">
              <PropertyFilter
                gensetProperties={gensetProperties}
                selectedProperties={selectedProperties}
                onPropertyChange={handlePropertyChange}
                onToggleSelectAll={toggleSelectAll}
              />
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            {unresolvedCount > 0 && (
              <button
                className="btn btn-warning btn-sm sm:btn-md text-base-content font-semibold"
                onClick={handleResolveAll}
                disabled={isResolvingAll}
              >
                {isResolvingAll ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Resolving...
                  </>
                ) : (
                  `Resolve Latest 50 `
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isResolvingAll && resolveProgress > 0 && (
            <div className="mb-4">
              <progress className="progress progress-success w-full" value={resolveProgress} max="100"></progress>
              <p className="text-sm text-center mt-2">{resolveProgress}% Complete</p>
            </div>
          )}

          {/* Mobile layout */}
          <div className="md:hidden flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
            <div className="flex flex-row w-full border-b border-base-content/20 shrink-0">
              <button
                className={"flex-1 py-2 text-xs sm:text-sm font-semibold transition-all " + (activeTab === "chart1" ? "border-b-2 border-primary text-primary" : "text-base-content/60")}
                onClick={() => setActiveTab("chart1")}
              >
                By Property
              </button>
              <button
                className={"flex-1 py-2 text-xs sm:text-sm font-semibold transition-all " + (activeTab === "chart2" ? "border-b-2 border-primary text-primary" : "text-base-content/60")}
                onClick={() => setActiveTab("chart2")}
              >
                By Time
              </button>
              <button
                className={"flex-1 py-2 text-xs sm:text-sm font-semibold transition-all " + (activeTab === "table" ? "border-b-2 border-primary text-primary" : "text-base-content/60")}
                onClick={() => setActiveTab("table")}
              >
                Anomalies
              </button>
            </div>

            <div className="flex-1 min-h-0 w-full mt-2">
              {activeTab === "chart1" && (
                <div className="w-full h-full bg-base-200 rounded p-2 sm:p-3">
                  <PropertyBarChart labels={labels} dataset={dataset} />
                </div>
              )}
              {activeTab === "chart2" && (
                <div className="w-full h-full bg-base-200 rounded p-2 sm:p-3">
                  <AnomaliesBarChart labels={labels1} dataset={dataset1} />
                </div>
              )}
              {activeTab === "table" && (
                <div className="w-full h-full min-h-0 flex flex-col">
                  <AnomaliesTable
                    data={currentNotifications}
                    onViewClick={handleViewClick}
                    onResolveClick={handleResolveAnomalies}
                    resolvingId={resolvingId}
                    isResolvingAll={isResolvingAll}
                    startIndex={indexOfFirstItem + 1}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    itemsPerPage={itemsPerPage}
                   onPageChange={(page) => fetchNotifications(page)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:grid grid-cols-2 gap-3 items-start min-h-0">
            {/* Left: all charts */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="aspect-video bg-base-200 rounded-lg overflow-hidden border border-base-content/5 shadow-sm min-w-0">
                <PropertyBarChart labels={labels} dataset={dataset} />
              </div>

              <div className="aspect-video bg-base-200 rounded-lg overflow-hidden border border-base-content/5 shadow-sm min-w-0">
                <AnomaliesBarChart labels={labels1} dataset={dataset1} />
              </div>

              {/* Default: only the two charts above.
                  When the user selects one or more properties, show one line-chart card per selected property. */}
              {selectedProperties.map((propertyName) => {
                const series = getLineSeriesForProperty(propertyName);
                if (!series || series.length === 0) return null;

                return (
                  <div
                    key={propertyName}
                    className="aspect-video bg-base-200 rounded-lg overflow-hidden border border-base-content/5 shadow-sm min-w-0"
                  >
                    <AnomaliesLineChart value={series} />
                  </div>
                );
              })}
            </div>

            {/* Right: only table */}
            <div className="min-w-0 min-h-0 h-full">
           <AnomaliesTable
  data={currentNotifications}
  onViewClick={handleViewClick}
  onResolveClick={handleResolveAnomalies}
  resolvingId={resolvingId}
  isResolvingAll={isResolvingAll}
  startIndex={indexOfFirstItem + 1}
  currentPage={currentPage}
  totalPages={totalPages}
  totalRecords={totalRecords}
  itemsPerPage={itemsPerPage}
  onPageChange={(page) => fetchNotifications(page)}
/>
            </div>
          </div>

          {/* Graph Modal */}
          <AnomalyGraphModal
            isOpen={showGraph}
            onClose={() => setShowGraph(false)}
            graphData={graphData}
            selectedEntry={selectedEntry}
          />

          {/* Line charts grid (mobile only, desktop uses the 3rd chart section above) */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 mt-5 md:hidden">
            {lineEngFuleLavel.length > 0 && (
              <div className="w-full">
                <AnomaliesLineChart value={lineEngFuleLavel} />
              </div>
            )}
            {engSpeedDisplay.length > 0 && (
              <div className="w-full">
                <AnomaliesLineChart value={engSpeedDisplay} />
              </div>
            )}
            {engOilPress.length > 0 && (
              <div className="w-full">
                <AnomaliesLineChart value={engOilPress} />
              </div>
            )}
            {genL1Current.length > 0 && (
              <div className="w-full">
                <AnomaliesLineChart value={genL1Current} />
              </div>
            )}
            {genTotalVA.length > 0 && (
              <div className="w-full">
                <AnomaliesLineChart value={genTotalVA} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Anomalies;