import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FaFilter } from "react-icons/fa6";
import { useMessageBus } from "../lib/MessageBus";
import { formatTimestamp } from "../lib/Utils";
import "cally";
import { type Archive } from "../types/archive.types";
import { tuyau } from "../lib/Tuyau";
import Skeleton from "../components/Skeleton.jsx";
import DynamicTable, { type DynamicTableColumn } from "../components/DynamicTable";
import SelectAllCheckboxPopup from "../components/SelectAllCheckboxPopup";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import type { CalendarRangeProps, CalendarMonthProps } from "cally";

type MapEvents<T> = { [K in keyof T as K extends `on${infer E}` ? `on${Lowercase<E>}` : K]: T[K] };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-month": MapEvents<CalendarMonthProps> & React.HTMLAttributes<HTMLElement>;
      "calendar-range": MapEvents<CalendarRangeProps> & React.HTMLAttributes<HTMLElement>;
    }
  }
}

const excelify = async (data: Archive[]) => {
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

const Archive = () => {
  const confirmAction = (message: string): boolean => {
    return (globalThis as any).confirm?.(message) ?? false;
  };

  const { data: allGensetPropertiesData, isLoading: allGensetPropertiesIsLoading, isError: allGensetPropertiesIsError } =
    useQuery({
      queryKey: ["genset-properties"],
      queryFn: () => tuyau.property.getAll.$get().unwrap(),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  const [archiveData, setArchiveData] = useState<Archive[] | null>(null);
  const [paginationMetadata, setPaginationMetadata] = useState<any>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
        setArchiveData(paginatedData.data.data as unknown as Archive[]);
        setPaginationMetadata(paginatedData.data.meta);
      }
    },
  });

  const { mutate: deleteArchive } = useMutation({
    mutationKey: ["archive", "delete"],
    mutationFn: (ids: string[]) => tuyau.archive.delete.$post({ ids }),
    onSuccess: () => {
      toast.success("Deleted successfully");
      mutatePaginatedData(filters);
      setSelectedIds([]);
    },
    onError: () => {
      toast.error("Delete failed");
    },
  });

  const { mutate: deleteAllArchive } = useMutation({
    mutationKey: ["archive", "delete-all"],
    mutationFn: () => tuyau.archive.deleteAll.$delete(),
    onSuccess: () => {
      toast.success("All data deleted successfully");
      setArchiveData([]);
      setSelectedIds([]);
      setFilters((prev) => ({ ...prev, page: 1 }));
      mutatePaginatedData({ ...filters, page: 1 });
    },
    onError: () => {
      toast.error("Delete all failed");
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
  useMessageBus("archive", () => {
    if (timeoutRef.current) return;
    timeoutRef.current = setTimeout(() => {
      mutatePaginatedData(filters);
      timeoutRef.current = null;
    }, 2000);
  });

  const handleResetFilters = () => {
    setFilters({ page: 1, propertyNames: [], isAnomaly: undefined, from: undefined, to: undefined });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("No rows selected");
      return;
    }
    const confirmed = confirmAction(`Are you sure you want to delete ${selectedIds.length} record(s)? This action cannot be undone.`);
    if (confirmed) deleteArchive(selectedIds);
  };

  const handleDeleteAllData = () => {
    const confirmed = confirmAction("Are you sure you want to delete ALL records? This action cannot be undone.");
    if (confirmed) deleteAllArchive();
  };

  const isGensetPropsLoading = allGensetPropertiesIsLoading || !allGensetPropertiesData;
  const showArchiveError = isError;
  const showGensetPropsError = allGensetPropertiesIsError;

  const timestampFilter = (
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
  );

  const propertyOptions = (allGensetPropertiesData ?? []).map((property) => ({
    value: property.propertyName,
    label: property.readablePropertyName,
  }));

  const isPropertySelectAll = (filters.propertyNames?.length ?? 0) === 0;
  const propertySet = new Set(filters.propertyNames ?? []);

  const propertyFilter = (
    <SelectAllCheckboxPopup
      trigger={
        <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
          <FaFilter size={24} />
        </div>
      }
      widthClassName="w-auto"
      selectAllLabel="Select All"
      selectAllChecked={isPropertySelectAll}
      onToggleSelectAll={(checked) => {
        setFilters((prev) => ({
          ...prev,
          page: 1,
          propertyNames: checked ? [] : propertyOptions.map((p) => p.value),
        }));
      }}
      options={propertyOptions}
      getOptionChecked={(value) => isPropertySelectAll || propertySet.has(value)}
      onToggleOption={(value, checked) => {
        const allValues = propertyOptions.map((p) => p.value);

        setFilters((prev) => {
          const prevAll = (prev.propertyNames?.length ?? 0) === 0;
          const currentSet = new Set(prev.propertyNames ?? []);

          // In "all mode" (empty array), UI shows everything checked.
          // Unchecking one option should switch to explicit selection = all except the unchecked one.
          if (prevAll) {
            if (checked) return { ...prev, page: 1, propertyNames: [] };
            return { ...prev, page: 1, propertyNames: allValues.filter((v) => v !== value) };
          }

          if (checked) currentSet.add(value);
          else currentSet.delete(value);

          const nextValues = Array.from(currentSet);

          // Backend treats empty as "no filtering" => all.
          if (nextValues.length === 0 || nextValues.length === allValues.length) {
            return { ...prev, page: 1, propertyNames: [] };
          }

          return { ...prev, page: 1, propertyNames: nextValues };
        });
      }}
    />
  );

  const anomalyOptions = [
    { value: "anomalous" as const, label: "Anomalous" },
    { value: "nonAnomalous" as const, label: "Non-Anomalous" },
  ];

  type AnomalyOptionValue = (typeof anomalyOptions)[number]["value"];

  const anomalousChecked = filters.isAnomaly !== false; // true OR undefined
  const nonAnomalousChecked = filters.isAnomaly !== true; // false OR undefined
  const isAnomalySelectAll = filters.isAnomaly === undefined;

  const anomalyFilter = (
    <SelectAllCheckboxPopup<AnomalyOptionValue>
      trigger={
        <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
          <FaFilter size={24} />
        </div>
      }
      widthClassName="w-64"
      selectAllLabel="Select All"
      selectAllChecked={isAnomalySelectAll}
      onToggleSelectAll={(checked) => {
        setFilters((prev) => ({ ...prev, page: 1, isAnomaly: checked ? undefined : true }));
      }}
      options={anomalyOptions}
      getOptionChecked={(value) => (value === "anomalous" ? anomalousChecked : nonAnomalousChecked)}
      onToggleOption={(value, checked) => {
        const nextAnomalous = value === "anomalous" ? checked : anomalousChecked;
        const nextNonAnomalous = value === "nonAnomalous" ? checked : nonAnomalousChecked;

        const nextIsAnomaly =
          nextAnomalous && nextNonAnomalous
            ? undefined
            : nextAnomalous
              ? true
              : nextNonAnomalous
                ? false
                : undefined; // unselecting everything => select-all semantics

        setFilters((prev) => ({ ...prev, page: 1, isAnomaly: nextIsAnomaly }));
      }}
    />
  );

  const columns = useMemo<DynamicTableColumn<Archive>[]>(
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
    <DynamicTable
      title="Historical Genset Data"
      actions={
        <>
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
                  const data: Archive[] = Array.isArray(rawData)
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
            className="btn btn-primary"
          >
            Export to Excel
          </button>
          <button onClick={handleResetFilters} className="btn btn-primary">
            Reset Filters
          </button>
          <button onClick={handleDeleteSelected} className="btn btn-error" disabled={selectedIds.length === 0}>
            Delete Selected ({selectedIds.length})
          </button>
          <button onClick={handleDeleteAllData} className="btn btn-error btn-outline">
            Delete All Data
          </button>
        </>
      }
      columns={columns}
      data={archiveData ?? []}
      isLoading={!showArchiveError && (!showGensetPropsError && (isGensetPropsLoading || isPending || archiveData === null))}
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
  );
};

export default Archive;
