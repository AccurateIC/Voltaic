import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { FaFileExport, FaFilter } from "react-icons/fa6";
import { cn, formatTimestamp } from "../lib/Utils";
import * as XLSX from "xlsx";
import { RiResetLeftLine } from "react-icons/ri";
// TODO: add button loading state until the notification is marked as resolved

const Alarms = () => {
  const [notifications, setNotifications] = useState([]); // original notifications
  const [filteredNotifications, setFilteredNotifications] = useState([]); // filtered notifications
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: DateTime.now().toISODate(),
    property: "Property",
    anomalyStatus: "",
  });

  const handleAnomalyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, anomalyStatus: event.target.value }));
  };
  const handleGensetPropertyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, property: event.target.value }));
  };
  const handleFromDateFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, fromDate: event.target.value }));
  };
  const handleToDateFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, toDate: event.target.value }));
  };
  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: DateTime.now().toISODate(),
      property: "Property",
      anomalyStatus: "",
    });
  };

  // apply filters whenever filters or notifications change
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by date range
    if (filters.fromDate) {
      filtered = filtered.filter((notif) => DateTime.fromISO(notif.startedAt) >= DateTime.fromISO(filters.fromDate));
    }
    if (filters.toDate) {
      filtered = filtered.filter(
        (notif) => DateTime.fromISO(notif.startedAt) <= DateTime.fromISO(filters.toDate).endOf("day")
      );
    }

    // Filter by property
    if (filters.property && filters.property !== "Property") {
      filtered = filtered.filter((notif) => notif.archive.gensetProperty.readablePropertyName === filters.property);
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

  const handleMarkNotificationAsRead = async (notificationId) => {
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

  const exportToExcel = () => {
    // early return when no data
    if (filteredNotifications.length === 0) {
      toast.info("No data available for export");
      return;
    }

    // prepare data for export
    const exportData = filteredNotifications.map((entry, index) => ({
      "No.": index + 1,
      ID: entry.id,
      "Started At": formatTimestamp(entry.startedAt),
      Summary: entry.summary,
      Message: entry.message,
      "Finished At": entry.finishedAt !== null ? formatTimestamp(entry.finishedAt) : "N/A",
      Status: entry.shouldBeDisplayed ? "Unresolved" : "Resolved",
    }));

    // create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // set column widths
    const columnWidths = [
      { wch: 5 }, // No.
      { wch: 5 }, // Id
      { wch: 20 }, // Started At
      { wch: 50 }, // Summary
      { wch: 40 }, // Message
      { wch: 20 }, // Finished At
      { wch: 15 }, // Status
    ];
    ws["!cols"] = columnWidths;

    // create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alarms");

    // generate file name with current date
    const fileName = `alarms_${new Date().toISOString().split("T")[0]}.xlsx`;

    // save file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex flex-row justify-between bg-primary text-base-200 font-semibold items-center rounded-box p-4 mb-2">
        {/* Filters */}
        <div className="flex gap-3 items-center">
          <FaFilter size={48} />
          <div className="flex items-center">
            <div className="m-1">From:</div>
            <input
              aria-label="Date"
              type="date"
              className="input text-base-content"
              value={filters.fromDate}
              onChange={handleFromDateFilterChange}
            />
          </div>
          <div className="flex items-center">
            <div className="m-1">To:</div>
            <input
              aria-label="Date"
              type="date"
              className="input text-base-content"
              value={filters.toDate}
              onChange={handleToDateFilterChange}
            />
          </div>

          {/* Genset Property */}
          <div className="flex items-center">
            <div className="m-1">Properties:</div>
            <select
              className="select select-neutral text-base-content"
              value={filters.property}
              onChange={handleGensetPropertyFilterChange}>
              <option value="Property">All</option>
              {gensetProperties.map((property, index) => (
                <option key={index} value={property.readablePropertyName}>
                  {property.readablePropertyName}
                </option>
              ))}
            </select>
          </div>

          {/* Anomaly Status */}
          <div className="flex items-center">
            <div className="m-1">Anomaly Status:</div>
            <select
              className="select select-neutral text-base-content"
              value={filters.anomalyStatus}
              onChange={handleAnomalyFilterChange}>
              <option value="">All</option>
              <option value="Resolved">Resolved</option>
              <option value="Unresolved">Unresolved</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-success text-base-200 font-semibold" onClick={exportToExcel}>
            <FaFileExport className="mr-2" /> Export
          </button>
          <button className="btn btn-neutral text-base-200 font-semibold hover:bg-base-content" onClick={handleResetFilters}>
            <RiResetLeftLine /> Reset
          </button>
        </div>
      </div>

      {/* Notification Table */}
      <div className="overflow-y-scroll rounded-box shadow-lg bg-base-content text-base-200">
        <table className="table table-pin-rows">
          <thead className="">
            <tr className="bg-sky-950 text-base-200">
              <th></th>
              <th>Started At</th>
              <th>Summary</th>
              <th>Message</th>
              <th>Finished At</th>
              <th>Resolve</th>
            </tr>
          </thead>
          <tbody className="bg-sky-950/50">
            {filteredNotifications.map((entry, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{formatTimestamp(entry.startedAt)}</td>
                <td>{entry.summary}</td>
                <td>{entry.message}</td>
                <td>{entry.finishedAt !== null ? formatTimestamp(entry.finishedAt) : "N/A"}</td>
                <td>
                  <button
                    onClick={() => handleMarkNotificationAsRead(entry.id)}
                    className={cn(
                      "btn btn-outline btn-info",
                      `${entry.shouldBeDisplayed ? "" : "btn btn-disabled text-base-300/50"}`
                    )}>
                    {entry.shouldBeDisplayed ? "Resolve" : "Resolved"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alarms;
