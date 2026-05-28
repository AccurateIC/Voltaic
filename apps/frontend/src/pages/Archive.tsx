import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FaFilter } from "react-icons/fa6";
import { useMessageBus } from "../lib/MessageBus";
import { formatTimestamp } from "../lib/Utils";
import "cally";
import type { Archive as ArchiveRow } from "../types/archive.types";
import { tuyau } from "../lib/Tuyau";
import Skeleton from "../components/Skeleton.jsx";
import DynamicTable, { type DynamicTableColumn } from "../components/DynamicTable";
import SelectAllCheckboxPopup from "../components/SelectAllCheckboxPopup";
import { useMutation } from "@tanstack/react-query";
import { useGensetPropertiesQuery } from "../hooks/useGensetPropertiesQuery";
import { DateTime } from "luxon";
import type { HTMLAttributes } from "react";
import type { CalendarRangeProps, CalendarMonthProps } from "cally";
import { TransmitChannels } from "../lib/TransmitChannels";
import { BACKEND_BASE_URL } from "../config/backend";

type MapEvents<T> = { [K in keyof T as K extends `on${infer E}` ? `on${Lowercase<E>}` : K]: T[K] };

/* eslint-disable no-unused-vars -- `react` JSX namespace merge; nested names are type positions only */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-month": MapEvents<CalendarMonthProps> & HTMLAttributes<HTMLElement>;
      "calendar-range": MapEvents<CalendarRangeProps> & HTMLAttributes<HTMLElement>;
    }
  }
}
/* eslint-enable no-unused-vars */

const excelify = async (data: ArchiveRow[]) => {
  if (!data || data.length === 0) {
    toast.error("No data to export.");
    return false;
  }

  const XLSX = await import("xlsx");

  const excelData = data.map((entry, index) => {
    const timestamp = entry?.timestamp ? formatTimestamp(entry.timestamp) : "";
    const propName = entry?.gensetProperty?.readablePropertyName ?? (entry as any)?.propertyName ?? "";
    const unit = entry?.gensetProperty?.physicalQuantity?.unitSymbol ?? "";
    return {
      "Sr No": index + 1,
      ID: entry?.id ?? "",
      Timestamp: timestamp,
      Property: propName,
      Value: `${entry?.propertyValue ?? ""} ${unit}`.trim(),
    };
  });

  const ws = XLSX.utils.json_to_sheet(excelData);
  ws["!cols"] = [{ wch: 5 }, { wch: 10 }, { wch: 30 }, { wch: 40 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Genset Data");
  const fileName = `genset_data_${DateTime.utc().toFormat("yyyy-LL-dd_HH-mm-ss")}.xlsx`;

  try {
    XLSX.writeFile(wb, fileName);
    return true;
  } catch {
    toast.error("Failed to generate Excel file.");
    return false;
  }
};

interface GetPaginatedArchiveDataFilters {
  from?: string;
  to?: string;
  isAnomaly?: boolean;
  propertyNames?: string[];
  page: number;
}

const ArchivePage = () => {
const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

const showConfirm = (message: string, onConfirm: () => void) => {
  setConfirmModal({ message, onConfirm });
};
  const {
    data: allGensetPropertiesData,
    isLoading: allGensetPropertiesIsLoading,
    isError: allGensetPropertiesIsError,
  } = useGensetPropertiesQuery();
const [archiveData, setArchiveData] = useState<ArchiveRow[] | null>(null);
const [paginationMetadata, setPaginationMetadata] = useState<any>();
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);
  
  const [filters, setFilters] = useState<GetPaginatedArchiveDataFilters>({
    page: 1,
    propertyNames: [],
    isAnomaly: undefined,
    from: undefined,
    to: undefined,
  });

const { mutate: mutatePaginatedData, isError, isPending } = useMutation({
  mutationKey: ["archive", "get-paginated"],
  mutationFn: (requestFilters: GetPaginatedArchiveDataFilters) => tuyau.archive.getPaginated.$post(requestFilters),
  onSuccess: (paginatedData) => {
    if (paginatedData?.data) {
      setArchiveData(paginatedData.data.data as unknown as ArchiveRow[]);
      setPaginationMetadata(paginatedData.data.meta);
    }
    setIsBackgroundRefresh(false);
  },
  onError: () => {
    setIsBackgroundRefresh(false);
  },
});

 const { mutate: deleteArchive } = useMutation({
  mutationKey: ["archive", "delete"],
  mutationFn: async (ids: string[]) => {
    const res = await tuyau.archive.delete.$post({ ids });
    if (res.error) throw res.error;
    return res.data;
  },
  onSuccess: () => {
    toast.success("Deleted successfully");
    mutatePaginatedData(filters);
    setSelectedIds([]);
  },
  onError: (error: any) => {
    console.error("Delete selected error:", error);
    toast.error(`Delete failed: ${error?.message ?? "Unknown error"}`);
  },
});
const { mutate: deleteAllArchive, isPending: isDeleteAllPending } = useMutation({
  mutationKey: ["archive", "delete-all"],
  mutationFn: async () => {
    const res = await fetch(`${BACKEND_BASE_URL}/archive/deleteAll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete all");
    }
    return res.json();
  },
  onMutate: () => {
    setArchiveData([]);
    setSelectedIds([]);
    setPaginationMetadata(undefined);
  },
  onSuccess: () => {
    toast.success("All data deleted successfully");
    setFilters((prev) => ({ ...prev, page: 1 }));
    mutatePaginatedData({ ...filters, page: 1 });
  },
  onError: (error: any) => {
    console.error("Delete all error:", error);
    toast.error(`Delete all failed: ${error?.message ?? "Unknown error"}`);
    mutatePaginatedData(filters); // restore data if delete failed
  },
});
  useEffect(() => {
    mutatePaginatedData(filters);
    setSelectedIds([]);
  }, [filters, mutatePaginatedData]);

  useEffect(() => {
    if (allGensetPropertiesIsError) toast.error("Failed to fetch genset properties");
  }, [allGensetPropertiesIsError]);

  useEffect(() => {
    if (isError) toast.error("Failed to fetch archive data");
  }, [isError]);

  const { mutate: mutateGetPropertyDataBetween } = useMutation({
    mutationKey: ["archive", "getPropertyDataBetween"],
    mutationFn: async (params: { from?: string; to?: string; properties?: string[] }) => {
      const res = await tuyau.archive.getPropertyDataBetween.$post(params);
      if (Array.isArray(res)) return res;
      if (Array.isArray((res as any)?.data)) return (res as any).data;
      if (Array.isArray((res as any)?.data?.data)) return (res as any).data.data;
      return res;
    },
    onError: () => {
      toast.error("Failed to fetch export data.");
    },
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 useMessageBus(TransmitChannels.ARCHIVE, () => {
    if (timeoutRef.current) return;
    timeoutRef.current = setTimeout(() => {
      setIsBackgroundRefresh(true); // flag: this is a silent background update
      mutatePaginatedData(filters);
      timeoutRef.current = null;
    }, 500);
  });

  const handleResetFilters = () => {
    setFilters({ page: 1, propertyNames: [], isAnomaly: undefined, from: undefined, to: undefined });
  };

 const handleDeleteSelected = () => {
  if (selectedIds.length === 0) {
    toast.error("No rows selected");
    return;
  }
  showConfirm(
    `Are you sure you want to delete ${selectedIds.length} record(s)? This action cannot be undone.`,
    () => deleteArchive(selectedIds)
  );
};

 const handleDeleteAllData = () => {
  showConfirm(
    "Are you sure you want to delete ALL records? This action cannot be undone.",
    () => deleteAllArchive()
  );
};
  const isGensetPropsLoading = allGensetPropertiesIsLoading || !allGensetPropertiesData;
  const showArchiveError = isError;
  const showGensetPropsError = allGensetPropertiesIsError;
const propertyOptions = useMemo(
  () =>
    (allGensetPropertiesData ?? []).map((property) => ({
      value: property.propertyName,
      label: property.readablePropertyName,
    })),
  [allGensetPropertiesData]
);

const isPropertySelectAll = (filters.propertyNames?.length ?? 0) === 0;
const propertySet = useMemo(() => new Set(filters.propertyNames ?? []), [filters.propertyNames]);
const timestampFilter = useMemo(
  () => (
    <div className="dropdown dropdown-bottom">
      <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
        <FaFilter size={24} />
      </div>
      <div className="dropdown-content card bg-base-100 shadow">
        <calendar-range
          value={
            filters.from && filters.to
              ? `${DateTime.fromISO(filters.from).toFormat("yyyy-MM-dd")}/${DateTime.fromISO(filters.to).toFormat("yyyy-MM-dd")}`
              : ""
          }
          max={DateTime.now().toFormat("yyyy-MM-dd")}
          className="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
          onchange={(event: Event) => {
            const value = ((event.target as unknown as { value?: string })?.value ?? "");
            if (!value) return;
            const [from, to] = value.split("/");
            if (!from || !to) return;
            const fromDT = DateTime.fromISO(from);
            const toDT = DateTime.fromISO(to);
            if (!fromDT.isValid || !toDT.isValid) return;
            setFilters((prev) => ({
              ...prev,
              from: fromDT.startOf("day").toISO()!,
              to: toDT.endOf("day").toISO()!,
              page: 1,
            }));
          }}
        >
          <calendar-month />
        </calendar-range>
      </div>
    </div>
  ),
  [filters.from, filters.to]
);

  const propertyFilter = useMemo(
  () => (
    <SelectAllCheckboxPopup
      trigger={
        <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
          <FaFilter size={24} />
        </div>
      }
      widthClassName="w-auto"
      selectAllLabel="Select All"
      selectAllChecked={isPropertySelectAll}
  // inside propertyFilter
// inside anomalyFilter
onToggleSelectAll={(checked) => {
  setIsBackgroundRefresh(true);
  setFilters((prev) => ({ ...prev, page: 1, isAnomaly: checked ? undefined : true }));
}}
      options={propertyOptions}
      getOptionChecked={(value) => isPropertySelectAll || propertySet.has(value)}
    onToggleOption={(value, checked) => {
  setIsBackgroundRefresh(true);
  const allValues = propertyOptions.map((p) => p.value);
  setFilters((prev) => {
          const prevAll = (prev.propertyNames?.length ?? 0) === 0;
          const currentSet = new Set(prev.propertyNames ?? []);
          if (prevAll) {
            if (checked) return { ...prev, page: 1, propertyNames: [] };
            return { ...prev, page: 1, propertyNames: allValues.filter((v) => v !== value) };
          }
          if (checked) currentSet.add(value);
          else currentSet.delete(value);
          const nextValues = Array.from(currentSet);
          if (nextValues.length === 0 || nextValues.length === allValues.length) {
            return { ...prev, page: 1, propertyNames: [] };
          }
          return { ...prev, page: 1, propertyNames: nextValues };
        });
      }}
    />
  ),
  [isPropertySelectAll, propertyOptions, propertySet]
);

  const anomalyOptions = useMemo(
    () => [
      { value: "anomalous" as const, label: "Anomalous" },
      { value: "nonAnomalous" as const, label: "Non-Anomalous" },
    ],
    []
  );

  type AnomalyOptionValue = (typeof anomalyOptions)[number]["value"];

  const anomalousChecked = filters.isAnomaly !== false;
  const nonAnomalousChecked = filters.isAnomaly !== true;
  const isAnomalySelectAll = filters.isAnomaly === undefined;
const anomalyFilter = useMemo(
    () => (
   <SelectAllCheckboxPopup<AnomalyOptionValue>
  trigger={
    <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
      <FaFilter size={24} />
    </div>
  }
  widthClassName="w-64"
  dropdownEnd={true}
  selectAllLabel="Select All"
        selectAllChecked={isAnomalySelectAll}
     onToggleSelectAll={(checked) => {
  setIsBackgroundRefresh(true);
  setFilters((prev) => ({
    ...prev,
    page: 1,
    propertyNames: checked ? [] : propertyOptions.map((p) => p.value),
  }));
}}
        options={anomalyOptions}
        getOptionChecked={(value) => (value === "anomalous" ? anomalousChecked : nonAnomalousChecked)}
       onToggleOption={(value, checked) => {
  setIsBackgroundRefresh(true);
  const nextAnomalous = value === "anomalous" ? checked : anomalousChecked;
          const nextNonAnomalous = value === "nonAnomalous" ? checked : nonAnomalousChecked;
          const nextIsAnomaly =
            nextAnomalous && nextNonAnomalous
              ? undefined
              : nextAnomalous
                ? true
                : nextNonAnomalous
                  ? false
                  : undefined;
          setFilters((prev) => ({ ...prev, page: 1, isAnomaly: nextIsAnomaly }));
        }}
      />
    ),
    [isAnomalySelectAll, anomalyOptions, anomalousChecked, nonAnomalousChecked]
  );

  const columns = useMemo<DynamicTableColumn<ArchiveRow>[]>(
    () => [
      {
        key: "serial",
        header: "Sr No",
        cell: (_, index) => (filters.page - 1) * (paginationMetadata?.perPage ?? 20) + index + 1,
      },
      { key: "id", header: "ID", cell: (entry) => entry.id },
      { key: "timestamp", header: "Timestamp", filter: timestampFilter, cell: (entry) => formatTimestamp(entry.timestamp) },
      { key: "property", header: "Property", filter: propertyFilter, cell: (entry) => entry.gensetProperty.readablePropertyName },
      {
        key: "value",
        header: "Value",
        cell: (entry) => `${entry.propertyValue} ${entry.gensetProperty.physicalQuantity.unitSymbol}`,
      },
      { key: "anomaly", header: "Anomaly", filter: anomalyFilter, cell: (entry) => (entry.isAnomaly ? "Yes" : "No") },
    ],
    [filters.page, paginationMetadata?.perPage, timestampFilter, propertyFilter, anomalyFilter]
  );

  const errorContent = (
    <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "60vh" }}>
      <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="opacity-30">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-base-content font-semibold text-xl">Failed to load data</p>
        <p className="text-base-content opacity-40 text-base text-center max-w-md">
          {showGensetPropsError ? "Failed to load available properties for filtering." : "Failed to load archive data."}
        </p>
      </div>
    </div>
  );

  const emptyContent = (
    <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "60vh" }}>
      <div className="w-24 h-24 rounded-full bg-base-300 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="opacity-30">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-base-content font-semibold text-xl">No records found</p>
        <p className="text-base-content opacity-40 text-base text-center max-w-md">
          {filters.from || filters.to
            ? "No data was recorded for the selected date range. Try a different date or reset the filters."
            : "No archive data is currently available."}
        </p>
      </div>
      <button onClick={handleResetFilters} className="btn btn-outline btn-md">
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col px-4 py-4 md:px-6 md:py-5">
      <DynamicTable
        title="Historical Genset Data"
     actions={
 <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
    <button
      onClick={async () => {
        const params = {
          from: filters.from,
          to: filters.to,
          properties: (filters.propertyNames?.length ?? 0) > 0 ? filters.propertyNames : undefined,
        };

        if (params.from && params.to) {
          const fromDate = new Date(params.from);
          const toDate = new Date(params.to);
          if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            toast.error("Invalid date format for export range.");
            return;
          }
          if (fromDate > toDate) {
            toast.error("'From' date must be earlier than or equal to 'To' date.");
            return;
          }
        }

        mutateGetPropertyDataBetween(params, {
          onSuccess: async (rawData: any) => {
            const data: ArchiveRow[] = Array.isArray(rawData)
              ? rawData
              : Array.isArray(rawData?.data)
                ? rawData.data
                : Array.isArray(rawData?.data?.data)
                  ? rawData.data.data
                  : [];

            if (!data.length) {
              toast.error("No data found to export!");
              return;
            }

            const ok = await excelify(data);
            if (ok !== false) toast.success("Data successfully exported to Excel.");
          },
        });
      }}
     className="btn btn-primary w-full md:w-auto"
    >
      
      Export to Excel
    </button>
    <button onClick={handleResetFilters} className="btn btn-primary w-full md:w-auto">
      Reset Filters
    </button>
    <button onClick={handleDeleteSelected} className="btn btn-error w-full md:w-auto" disabled={selectedIds.length === 0}>
      Delete Selected ({selectedIds.length})
    </button>
    <button
      onClick={handleDeleteAllData}
      className="btn btn-error btn-outline w-full md:w-auto"
      disabled={isDeleteAllPending}
    >
     {isDeleteAllPending ? (
        <>
          <span className="loading loading-spinner loading-xs" />
          Deleting...
        </>
      ) : (
        "Delete All Data"
      )}
    </button>
  </div>
}
      columns={columns}
      data={archiveData ?? []}
     isLoading={!showArchiveError && (!showGensetPropsError && (isGensetPropsLoading || (isPending && !isBackgroundRefresh) || archiveData === null))}
      loadingContent={<Skeleton type="table" rows={10} columns={7} />}
      emptyContent={showArchiveError || showGensetPropsError ? errorContent : emptyContent}
      enableRowSelection
      selectedRowIds={selectedIds}
      onSelectedRowIdsChange={setSelectedIds}
      getRowId={(row) => String(row.id)}
      pagination={
        paginationMetadata
          ? {
              currentPage: filters.page,
              totalPages: paginationMetadata?.lastPage ?? 1,
              onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
              totalRecords: paginationMetadata?.total ?? 0,
              itemsPerPage: paginationMetadata?.perPage ?? 20,
              isLoading: isPending,
            }
          : undefined
      }
    />
  {confirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Are you sure?</h3>
            <p className="py-4 text-base-content opacity-70">{confirmModal.message}</p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmModal(null)} />
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
