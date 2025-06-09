import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus.ts";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { FaFileExport, FaFilter } from "react-icons/fa6";
import { cn, formatTimestamp } from "../lib/Utils";
import * as XLSX from "xlsx";
import { RiResetLeftLine } from "react-icons/ri";
import "cally";
import { useGensetProperty } from "../hooks/useGensetProperty.ts";
// TODO: add button loading state until the notification is marked as resolved

const Alarms = () => {
  const [notifications, setNotifications] = useState([]); // original notifications
  const [filteredNotifications, setFilteredNotifications] = useState([]); // filtered notifications
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    property: "Property",
    anomalyStatus: "",
  });

  // hooks
  const { getAllGensetProperties } = useGensetProperty();
  const gensetProperties = getAllGensetProperties.data;

  const handleAnomalyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, anomalyStatus: event.target.value }));
  };
  const handleGensetPropertyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, property: event.target.value }));
  };
  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
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

  useEffect(() => {
    // Check if the cally changes the from and to dates
    console.log("Cally date change event:", filters.fromDate, filters.toDate);
  }, [filters.fromDate, filters.toDate]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex flex-row justify-between text-base-content font-semibold items-center rounded-box p-4 mb-2">
        {/* Filters */}
        <div className="flex gap-3 items-center">
          <span className="text-2xl">Alarms</span>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary text-base-content font-semibold" onClick={exportToExcel}>
            {/* <FaFileExport className="mr-2" />  */}
            Export to Excel
          </button>
          <button className="btn btn-primary text-base-content font-semibold" onClick={handleResetFilters}>
            {/* <RiResetLeftLine /> */}
            Reset Filters
          </button>
        </div>
      </div>

      {/* Notification Table */}
      <div className="h-full overflow-auto rounded-box shadow-lg bg-base-200 text-base-content">
        <table className="table table-pin-rows table-fixed w-full">
          <thead className="">
            <tr className="bg-base-100 text-base-content">
              <th>S. No.</th>
              <th className="flex items-center">
                <span className="flex items-center">Started At</span>
                <div className="dropdown">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm m-1">
                    <FaFilter />
                  </div>
                  <div className="dropdown-content card bg-base-100 shadow">
                    <calendar-range
                      value={filters.fromDate !== "" && filters.toDate !== "" ? `${filters.fromDate}/${filters.toDate}` : ""}
                      class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
                      onchange={(event) => {
                        const val = event.target.value;

                        setFilters((prevFilters) => ({
                          ...prevFilters,
                          fromDate: val.split("/")[0],
                          toDate: val.split("/")[1],
                        }));
                      }}>
                      <calendar-month />
                    </calendar-range>
                  </div>
                </div>
              </th>
              <th>Summary</th>
              <th>Message</th>
              <th className="flex items-center">
                <span className="flex items-center">Property</span>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm m-1">
                    <FaFilter />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-50 w-64 p-2 shadow-sm max-h-256">
                    <div className="overflow-y-auto max-h-60">
                      <li value={"All"} onClick={() => setFilters((prev) => ({ ...prev, property: "Property" }))}>
                        <a>All</a>
                      </li>
                      {gensetProperties?.map((property, index) => (
                        <li
                          key={index}
                          value={property.readablePropertyName}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              property: property.readablePropertyName,
                            }))
                          }>
                          <a>{property.readablePropertyName}</a>
                        </li>
                      ))}
                    </div>
                  </ul>
                </div>
              </th>
              <th>Finished At</th>
              <th>
                <span>Resolve</span>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm m-1">
                    <FaFilter />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-50 w-64 p-2 shadow-sm max-h-256">
                    <div className="overflow-y-auto max-h-60">
                      <li value={"All"} onClick={() => setFilters((prev) => ({ ...prev, anomalyStatus: null }))}>
                        <a>All</a>
                      </li>
                      <li value="Resolved" onClick={() => setFilters((prev) => ({ ...prev, anomalyStatus: "Resolved" }))}>
                        <a>Resolved</a>
                      </li>
                      <li
                        value="Unresolved"
                        onClick={() => setFilters((prev) => ({ ...prev, anomalyStatus: "Unresolved" }))}>
                        <a>Unresolved</a>
                      </li>
                    </div>
                  </ul>
                </div>
              </th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody className="bg-base-200 text-base-content">
            {filteredNotifications.map((entry, index) => (
              <tr key={index} className="hover:bg-base-300">
                <td>{index + 1}</td>
                <td>{formatTimestamp(entry.startedAt)}</td>
                <td>{entry.summary}</td>
                <td>{entry.message}</td>
                <td>{entry.archive.gensetProperty.readablePropertyName}</td>
                <td>{entry.finishedAt !== null ? formatTimestamp(entry.finishedAt) : "N/A"}</td>
                <td>
                  <button
                    onClick={() => handleMarkNotificationAsRead(entry.id)}
                    className={cn("btn btn-outline btn-info", `${entry.shouldBeDisplayed ? "" : "btn btn-disabled"}`)}>
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
