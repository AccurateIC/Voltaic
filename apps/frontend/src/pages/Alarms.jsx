import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { FaFilter } from "react-icons/fa6";
import { cn, formatTimestamp } from "../lib/Utils.ts";
import "cally";
import { tuyau } from "../lib/Tuyau";
import Skeleton from "../components/Skeleton";
import DynamicTable from "../components/DynamicTable";
import SelectAllCheckboxPopup from "../components/SelectAllCheckboxPopup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGensetPropertiesQuery } from "../hooks/useGensetPropertiesQuery";
import { useNotificationsPaginatedQuery } from "../hooks/useNotificationsPaginatedQuery";
import { BACKEND_BASE_URL } from "../config/backend";

const Alarms = () => {
  const queryClient = useQueryClient();
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isResolvingAll, setIsResolvingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({ fromDate: "", toDate: "", property: [], anomalyStatus: [] });

  const { data: gensetProperties } = useGensetPropertiesQuery();

  const { data: notificationsPayload, isLoading } = useNotificationsPaginatedQuery(currentPage);

  const notifications = useMemo(() => notificationsPayload?.data ?? [], [notificationsPayload]);
  const totalPages = notificationsPayload?.pagination?.pages ?? 1;
  const totalRecords = notificationsPayload?.pagination?.total ?? 0;

  const invalidateNotificationPages = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["notifications", "paginated"] });
  }, [queryClient]);

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId) => tuyau.notification.read[notificationId].$patch(),
    onSuccess: () => {
      invalidateNotificationPages();
    },
  });

  const handleResetFilters = () => {
    setFilters({ fromDate: "", toDate: "", property: [], anomalyStatus: [] });
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
    if (filters.property.length > 0) {
      filtered = filtered.filter((notif) => filters.property.includes(notif.archive.gensetProperty.readablePropertyName));
    }
    if (filters.anomalyStatus.length > 0) {
      filtered = filtered.filter((notif) =>
        (filters.anomalyStatus.includes("Resolved") && !notif.shouldBeDisplayed) ||
        (filters.anomalyStatus.includes("Unresolved") && notif.shouldBeDisplayed)
      );
    }
    setFilteredNotifications(filtered);
  }, [filters, notifications]);

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


    const toastId = toast.loading(`Resolving ${unresolvedNotifications.length} anomalies...`);

    try {
      const notificationIds = unresolvedNotifications.map((n) => n.id);

      const response = await fetch(`${BACKEND_BASE_URL}/notification/resolveMultiple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to resolve anomalies");
      }




      invalidateNotificationPages();

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


      // extra safety: ensure loading toast is not left hanging
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2200);
    }
  };

  const exportToExcel = async () => {
    if (filteredNotifications.length === 0) {
      toast.info("No data available for export");
      return;
    }

    const XLSX = await import("xlsx");

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
  const isPropertySelectAll = filters.property.length === 0;

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
          property: checked ? [] : propertyOptions.map((p) => p.value),
        }))
      }
      options={propertyOptions}
      getOptionChecked={(value) => isPropertySelectAll || filters.property.includes(value)}
      onToggleOption={(value, checked) =>
        setFilters((prev) => {
          const isAll = prev.property.length === 0;
          if (isAll && !checked) {
            return { ...prev, property: propertyOptions.map((p) => p.value).filter((v) => v !== value) };
          }
          const current = prev.property;
          if (checked) return { ...prev, property: [...current, value] };
          const next = current.filter((v) => v !== value);
          return { ...prev, property: next };
        })
      }
    />
  );

  const statusOptions = [
    { value: "Resolved", label: "Resolved" },
    { value: "Unresolved", label: "Unresolved" },
  ];
  const isStatusSelectAll = filters.anomalyStatus.length === 0;

  const statusFilter = (
    <SelectAllCheckboxPopup
      trigger={
        <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
          <FaFilter size={10} />
        </div>
      }
      widthClassName="w-auto"
      dropdownEnd={true}
      selectAllLabel="Select All"
      selectAllChecked={isStatusSelectAll}
      onToggleSelectAll={(checked) =>
        setFilters((prev) => ({
          ...prev,
          anomalyStatus: checked ? [] : ["Resolved", "Unresolved"],
        }))
      }
      options={statusOptions}
      getOptionChecked={(value) => isStatusSelectAll || filters.anomalyStatus.includes(value)}
      onToggleOption={(value, checked) =>
        setFilters((prev) => {
          const isAll = prev.anomalyStatus.length === 0;
          if (isAll && !checked) {
            // Was "Select All", uncheck one → keep all others selected
            return { ...prev, anomalyStatus: statusOptions.map((o) => o.value).filter((v) => v !== value) };
          }
          const current = prev.anomalyStatus;
          if (checked) return { ...prev, anomalyStatus: [...current, value] };
          const next = current.filter((v) => v !== value);
          return { ...prev, anomalyStatus: next };
        })
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
    <div className="h-full w-full flex flex-col px-4 py-4 md:px-6 md:py-5">
      <div className="flex flex-col lg:flex-row justify-between text-base-content font-semibold items-start lg:items-center rounded-box mb-4 gap-4">
        <div className="flex gap-3 items-center">
          <span className="text-xl md:text-2xl">Alarms</span>
        </div>

        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              className="btn btn-primary btn-sm md:btn-md flex-1 lg:flex-none text-base-content font-semibold"
              onClick={exportToExcel}
            >
              Export
            </button>
            <button
              className="btn btn-primary btn-sm md:btn-md flex-1 lg:flex-none text-base-content font-semibold"
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button
              className="hidden lg:block btn btn-warning btn-sm md:btn-md text-base-content font-semibold"
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
          <button
            className="lg:hidden btn btn-warning btn-sm md:btn-md w-full text-base-content font-semibold"
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
            onPageChange: (page) => setCurrentPage(page),
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