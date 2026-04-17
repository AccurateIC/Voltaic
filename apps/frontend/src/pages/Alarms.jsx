import { useEffect, useState, useCallback, useRef } from "react";
import { useMessageBus } from "../lib/MessageBus.ts";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { FaFilter } from "react-icons/fa6";
import { cn, formatTimestamp } from "../lib/Utils.ts";
import * as XLSX from "xlsx";
import "cally";
import { tuyau } from "../lib/Tuyau";
import Skeleton from "../components/Skeleton";
import DynamicTable from "../components/DynamicTable";
import SelectAllCheckboxPopup from "../components/SelectAllCheckboxPopup";
import { useQuery, useMutation } from "@tanstack/react-query";

const Alarms = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolvingAll, setIsResolvingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);
  const [resolveProgress, setResolveProgress] = useState(0);
  const [filters, setFilters] = useState({ fromDate: "", toDate: "", property: "Property", anomalyStatus: "" });

  const { data: gensetProperties } = useQuery({
    queryKey: ["genset-properties"],
    queryFn: () => tuyau.property.getAll.$get().unwrap(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const currentPageRef = useRef(currentPage);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

// ✅ 2. fetchNotifications second
  const fetchNotifications = useCallback(async (page = 1, showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const { data, error } = await tuyau.notification.getAll.$get({ query: { page, limit: 50 } });
      if (error) throw new Error(error.message || "Failed to fetch notification data");
      setNotifications(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalRecords(data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Error fetching notification data");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId) => tuyau.notification.read[notificationId].$patch(),
    onSuccess: () => {
      fetchNotifications(currentPageRef.current, false);
    },
  });

// ✅ 4. messageBus last
  const handleNotification = useCallback(() => {
    fetchNotifications(currentPage, false);
  }, [currentPage, fetchNotifications]);

  useMessageBus("notification", handleNotification);

  const handleResetFilters = () => {
    setFilters({ fromDate: "", toDate: "", property: "Property", anomalyStatus: "" });
    setCurrentPage(1);
  };

  useEffect(() => {
    let filtered = [...notifications];
    if (filters.fromDate) {
      filtered = filtered.filter((notif) => DateTime.fromISO(notif.startedAt) >= DateTime.fromISO(filters.fromDate));
    }
    if (filters.toDate) {
      filtered = filtered.filter((notif) => DateTime.fromISO(notif.startedAt) <= DateTime.fromISO(filters.toDate).endOf("day"));
    }
    if (filters.property && filters.property !== "Property") {
      filtered = filtered.filter((notif) => notif.archive.gensetProperty.readablePropertyName === filters.property);
    }
    if (filters.anomalyStatus) {
      filtered = filtered.filter((notif) =>
        (filters.anomalyStatus === "Resolved" && !notif.shouldBeDisplayed) ||
        (filters.anomalyStatus === "Unresolved" && notif.shouldBeDisplayed)
      );
    }
    setFilteredNotifications(filtered);
  }, [filters, notifications]);
  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleMarkNotificationAsRead = (notificationId) => {
    markNotificationAsReadMutation.mutate(notificationId, {
      onSuccess: () => {
        toast.success("Anomaly resolved!");
      },
      onError: (error) => {
        toast.error(error?.message || `Failed to resolve notification`);
      },
    });
  };

const handleResolveAll = async () => {
  const unresolvedNotifications = filteredNotifications.filter((notif) => notif.shouldBeDisplayed);

  if (unresolvedNotifications.length === 0) {
    toast.info("No unresolved anomalies to resolve");
    return;
  }

  setIsResolvingAll(true);
  setResolveProgress(0);

  const toastId = toast.loading(`Resolving ${unresolvedNotifications.length} anomalies...`);

  try {
    const notificationIds = unresolvedNotifications.map((n) => n.id);

    const response = await fetch("http://localhost:3333/notification/resolveMultiple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ notificationIds }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Failed to resolve anomalies");
    }

    setResolveProgress(100);
    await new Promise((resolve) => setTimeout(resolve, 500));

    await fetchNotifications(currentPage, false);

    toast.success(`Successfully resolved ${result.resolved} anomalies!`, {
      id: toastId,
      duration: 2000,
    });
  } catch (error) {
    toast.error(error?.message || "Error resolving anomalies", {
      id: toastId,
      duration: 3000,
    });
  } finally {
    setIsResolvingAll(false);
    setResolveProgress(0);

    // extra safety: ensure loading toast is not left hanging
    setTimeout(() => {
      toast.dismiss(toastId);
    }, 2200);
  }
};

  const exportToExcel = () => {
    if (filteredNotifications.length === 0) {
      toast.info("No data available for export");
      return;
    }

    const exportData = filteredNotifications.map((entry, index) => ({
      "No.": index + 1,
      ID: entry.id,
      "Started At": formatTimestamp(entry.startedAt),
      Summary: entry.summary,
      Message: entry.message,
      "Finished At": entry.finishedAt !== null ? formatTimestamp(entry.finishedAt) : "N/A",
      Status: entry.shouldBeDisplayed ? "Unresolved" : "Resolved",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const columnWidths = [
      { wch: 5 },
      { wch: 5 },
      { wch: 20 },
      { wch: 50 },
      { wch: 40 },
      { wch: 20 },
      { wch: 15 },
    ];
    ws["!cols"] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alarms");

    const fileName = `alarms_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const unresolvedCount = filteredNotifications?.filter((notif) => notif.shouldBeDisplayed).length ?? 0;

  const startedAtFilter = (
    <div className="dropdown dropdown-bottom">
      <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
        <FaFilter size={10} />
      </div>
      <div className="dropdown-content card bg-base-100 shadow">
        <calendar-range
          value={filters.fromDate !== "" && filters.toDate !== "" ? `${filters.fromDate}/${filters.toDate}` : ""}
          class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
          onchange={(event) => {
            const val = event.target?.value ?? "";
            const [fromDate, toDate] = val.split("/");
            setFilters((prevFilters) => ({ ...prevFilters, fromDate: fromDate ?? "", toDate: toDate ?? "" }));
          }}
        >
          <calendar-month />
        </calendar-range>
      </div>
    </div>
  );

  const propertyOptions = (gensetProperties ?? []).map((property) => ({
    value: property.readablePropertyName,
    label: property.readablePropertyName,
  }));
  const isPropertySelectAll = filters.property === "Property";

  const propertyFilter = (
    <SelectAllCheckboxPopup
      trigger={
        <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
          <FaFilter size={10} />
        </div>
      }
      widthClassName="w-auto"
      selectAllLabel="Select All"
      selectAllChecked={isPropertySelectAll}
      onToggleSelectAll={(checked) =>
        setFilters((prev) => ({
          ...prev,
          property: checked ? "Property" : propertyOptions[0]?.value ?? "Property",
        }))
      }
      options={propertyOptions}
      getOptionChecked={(value) => isPropertySelectAll || filters.property === value}
      onToggleOption={(value, checked) =>
        setFilters((prev) => ({
          ...prev,
          property: checked ? value : "Property",
        }))
      }
    />
  );

  const statusOptions = [
    { value: "Resolved", label: "Resolved" },
    { value: "Unresolved", label: "Unresolved" },
  ];
  const isStatusSelectAll = filters.anomalyStatus === "";

  const statusFilter = (
    <SelectAllCheckboxPopup
      trigger={
        <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
          <FaFilter size={10} />
        </div>
      }
      widthClassName="w-auto"
      selectAllLabel="Select All"
      selectAllChecked={isStatusSelectAll}
      onToggleSelectAll={(checked) =>
        setFilters((prev) => ({
          ...prev,
          anomalyStatus: checked ? "" : "Unresolved",
        }))
      }
      options={statusOptions}
      getOptionChecked={(value) => isStatusSelectAll || filters.anomalyStatus === value}
      onToggleOption={(value, checked) =>
        setFilters((prev) => ({
          ...prev,
          anomalyStatus: checked ? value : "",
        }))
      }
    />
  );

  const columns = [
    {
      key: "serial",
      header: "S. No.",
      cell: (_, index) => (currentPage - 1) * 50 + index + 1,
    },
    {
      key: "startedAt",
      header: "Started At",
      filter: startedAtFilter,
      cell: (entry) => formatTimestamp(entry.startedAt),
    },
    { key: "summary", header: "Summary", cell: (entry) => entry.summary },
    { key: "message", header: "Message", cell: (entry) => entry.message },
    {
      key: "property",
      header: "Property",
      filter: propertyFilter,
      cell: (entry) => entry.archive.gensetProperty.readablePropertyName,
    },
    {
      key: "finishedAt",
      header: "Finished At",
      cell: (entry) => (entry.finishedAt !== null ? formatTimestamp(entry.finishedAt) : "N/A"),
    },
    {
      key: "resolve",
      header: "Resolve",
      filter: statusFilter,
      cell: (entry) => (
        <button
          onClick={() => handleMarkNotificationAsRead(entry.id)}
          disabled={markNotificationAsReadMutation.isPending || isLoading}
          className={cn(
            "btn btn-sm btn-outline btn-info gap-1",
            entry.shouldBeDisplayed ? "" : "btn-disabled"
          )}
        >
          {entry.shouldBeDisplayed ? (
            markNotificationAsReadMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Resolving...
              </>
            ) : (
              "Resolve"
            )
          ) : (
            "Resolved"
          )}
        </button>
      ),
    },
  ];

  const emptyContent = (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-lg text-base-content/70">No alarms found for the selected filters.</p>
      <button className="btn btn-outline" onClick={handleResetFilters}>
        Reset
      </button>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between text-base-content font-semibold items-start md:items-center rounded-box mb-4 gap-4">
        <div className="flex gap-3 items-center">
          <span className="text-xl md:text-2xl">Alarms</span>
        </div>

        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <button
  className="btn btn-primary btn-sm md:btn-md flex-1 md:flex-none text-base-content font-semibold"
  onClick={exportToExcel}
>
  Export
</button>

          <button
  className="btn btn-primary btn-sm md:btn-md flex-1 md:flex-none text-base-content font-semibold"
  onClick={handleResetFilters}
>
  Reset
</button>

          <button
  className="btn btn-warning btn-sm md:btn-md flex-1 md:flex-none text-base-content font-semibold"
  onClick={handleResolveAll}
  disabled={isResolvingAll || markNotificationAsReadMutation.isPending || unresolvedCount === 0}
>
  {isResolvingAll ? (
    <>
      <span className="loading loading-spinner loading-sm"></span>
      Resolving...
    </>
  ) : (
    `Resolve All (${unresolvedCount})`
  )}
</button>
        </div>
      </div>

      {isResolvingAll && resolveProgress > 0 && (
        <div className="mb-4">
          <progress className="progress progress-success w-full" value={resolveProgress} max="100"></progress>
          <p className="text-sm text-center mt-2">{resolveProgress}% Complete</p>
        </div>
      )}

    <div className="h-full overflow-hidden flex flex-col rounded-box shadow-md bg-base-200 text-base-content">
        <DynamicTable
          columns={columns}
          data={filteredNotifications ?? []}
          isLoading={isLoading}
          loadingContent={
            <div className="p-4 bg-base-100 flex-1">
              <Skeleton type="table" rows={10} columns={7} />
            </div>
          }
          emptyContent={emptyContent}
          rowClassName={() => "hover:bg-base-300"}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: (page) => fetchNotifications(page),
            totalRecords,
            itemsPerPage: 50,
            isLoading,
          }}
        />
      </div>
    </div>
  );
};

export default Alarms;