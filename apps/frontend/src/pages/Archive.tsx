import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaFilter } from "react-icons/fa6";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { useMessageBus } from "../lib/MessageBus";
import { formatTimestamp } from "../lib/Utils";
import * as XLSX from "xlsx";
import "cally";
import { type Archive } from "../types/archive.types";
import { tuyau } from "../lib/Tuyau";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";

const excelify = (data: Archive[]) => {
  if (!data || data.length === 0) {
    toast.error("No data to export.");
    return false;
  }

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

  // sensible column widths
  ws["!cols"] = [
    { wch: 5 }, // Sr No
    { wch: 10 }, // ID
    { wch: 30 }, // Timestamp
    { wch: 40 }, // Property
    { wch: 15 }, // Value
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Genset Data");

  // timestamped filename in UTC: YYYY-MM-DD_HH-mm-ss
  const fileName = `genset_data_${DateTime.utc().toFormat("yyyy-LL-dd_HH-mm-ss")}.xlsx`;

  try {
    XLSX.writeFile(wb, fileName);
    return true;
  } catch (err) {
    console.error("Excel writeFile failed:", err);
    toast.error("Failed to generate Excel file.");
    return false;
  }
};

// interface Metadata {
//   total: number;
//   perPage: 20;
//   currentPage: 1;
//   lastPage: 3;
//   firstPage: 1;
//   firstPageUrl: "/?page=1";
//   lastPageUrl: "/?page=3";
//   nextPageUrl: "/?page=2";
//   previousPageUrl: null;
// }

interface GetPaginatedArchiveDataFilters {
  from?: string;
  to?: string;
  isAnomaly?: boolean;
  propertyNames?: string[];
  page: number;
}

const Archive = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const {
    data: allGensetPropertiesData,
    isLoading: allGensetPropertiesIsLoading,
    isError: allGensetPropertiesIsError,
  } = useQuery({ queryKey: ["all-genset-properties"], queryFn: () => tuyau.property.getAll.$get().unwrap() });

  // state
  const [archiveData, setArchiveData] = useState<Archive[]>([]);
  const [paginationMetadata, setPaginationMetadata] = useState();
  const [filters, setFilters] = useState<GetPaginatedArchiveDataFilters>({
    page: 1,
    propertyNames: [],
    isAnomaly: undefined,
    from: undefined,
    to: undefined,
  });

  const {
    mutate: mutatePaginatedData,
    data: paginatedData,
    isError,
    isPending,
  } = useMutation({
    mutationKey: ["archive", "get-paginated"],
    mutationFn: (filters: GetPaginatedArchiveDataFilters) => tuyau.archive.getPaginated.$post(filters),
    onSuccess: (paginatedData) => {
      setArchiveData(paginatedData.data.data);
      setPaginationMetadata(paginatedData.data.meta);
    },
  });

  // re-fetch paginated data on filter change
  useEffect(() => {
    mutatePaginatedData(filters);
  }, [filters]);

  // Export data mutation
  const {
    mutate: mutateGetPropertyDataBetween,
    data: getPropertyDataBetweenData,
    isError: getPropertyDataBetweenIsError,
    isPending: getPropertyDataBetweenIsPending,
  } = useMutation({
    mutationKey: ["archive", "getPropertyDataBetween"],
    mutationFn: async (params: { from?: string; to?: string; properties?: string[] }) => {
      const res = await tuyau.archive.getPropertyDataBetween.$post(params);

      // Normalize common response shapes:
      // - direct array
      // - { data: [...] }
      // - { data: { data: [...] } } (sometimes paginated)
      if (Array.isArray(res)) return res;
      if (Array.isArray((res as any)?.data)) return (res as any).data;
      if (Array.isArray((res as any)?.data?.data)) return (res as any).data.data;

      // fallback - return res as-is (caller will handle)
      return res;
    },
    onError: (err) => {
      console.error("Export fetch error:", err);
      toast.error("Failed to fetch export data.");
    },
  });

  // we receive message on this bus if archive table updates
  useMessageBus("archive", () => {
    mutatePaginatedData(filters);
  });

  const handleResetFilters = () => {
    setFilters({ page: 1, propertyNames: [], isAnomaly: undefined, from: undefined, to: undefined });
  };

  // Handle loading and error states AFTER all hooks are called
  if (allGensetPropertiesIsLoading || isPending) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  if (allGensetPropertiesIsError || !allGensetPropertiesData) {
    toast.error("Failed to fetch genset properties");
    return <div className="h-full w-full">N/A</div>;
  }

  if (isError) {
    toast.error("Failed to fetch archive data");
    return <div className="h-full w-full">Error loading archive data</div>;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-2xl text-base-content font-semibold flex items-center mb-2">Historical Genset Data</div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => {
              const params = {
                from: filters.from,
                to: filters.to,
                properties: (filters.propertyNames?.length ?? 0) > 0 ? filters.propertyNames : undefined,
              };

              // Basic validation: if both provided, ensure from <= to
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
                onError: (err) => {
                  console.error(`Failed to get data for the given filters: ${JSON.stringify(params)}`, err);
                },
                onSuccess: (rawData: any) => {
                  // Normalize data shapes returned by mutationFn just in case:
                  let data: Archive[] = [];
                  if (Array.isArray(rawData)) data = rawData;
                  else if (Array.isArray(rawData?.data)) data = rawData.data;
                  else if (Array.isArray(rawData?.data?.data)) data = rawData.data.data;
                  else if (Array.isArray(rawData?.items))
                    data = rawData.items; // fallback possibilities
                  else if (Array.isArray(rawData?.results)) data = rawData.results;
                  else {
                    // try to coerce single-object -> array
                    if (rawData && typeof rawData === "object" && Object.keys(rawData).length > 0) {
                      // If object looks like a single Archive, attempt to export it
                      data = [rawData as Archive];
                    } else {
                      data = [];
                    }
                  }

                  if (!data || data.length === 0) {
                    toast.error("No data found to export!");
                    return;
                  }

                  try {
                    const ok = excelify(data);
                    if (ok !== false) {
                      toast.success("Data successfully exported to Excel.");
                    }
                  } catch (e) {
                    console.error("Excel export failed:", e);
                    toast.error("Excel export failed.");
                  }
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
        </div>
      </div>
      {/* Notification Table */}
      <div className="flex-1 rounded-box shadow-lg bg-base-200 text-base-200 overflow-hidden">
        <div className="overflow-y-auto h-full">
          <table className="table table-pin-rows">
            <thead className="">
              <tr className="bg-base-100 text-base-content">
                <th>ID</th>
                {/* NEW TS BEGINS */}
                <th className="gap-2">
                  Timestamp
                  <div className="dropdown dropdown-bottom">
                    <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
                      <FaFilter size={24} />
                    </div>
                    <div className="dropdown-content card bg-base-100 shadow">
                      <calendar-range
                        value={filters.from !== null && filters.to !== null ? `${filters.from}/${filters.to}` : ""}
                        class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
                        onchange={(event) => {
                          const val = event.target.value;

                          setFilters((prevFilters) => ({
                            ...prevFilters,
                            from: val.split("/")[0],
                            to: val.split("/")[1],
                          }));
                        }}
                      >
                        <calendar-month />
                      </calendar-range>
                    </div>
                  </div>
                </th>

                {/* NEW TS ENDS */}
                <th className="flex gap-2 relative">
                  Property
                  <div className="dropdown dropdown-bottom">
                    <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
                      <FaFilter size={24} />
                    </div>
                    <div
                      tabIndex={0}
                      className="dropdown-content z-10 max-h-64 w-56 overflow-y-auto bg-base-100 rounded-box shadow-lg"
                    >
                      <ul className="menu menu-compact p-2">
                        <li>
                          <a
                            onClick={() =>
                              setFilters((prevFilters) => ({ ...prevFilters, page: 1, propertyNames: [] }))
                            }
                          >
                            Select All
                          </a>
                        </li>
                        {allGensetPropertiesData.map((property, index) => (
                          <li key={index} className="flex flex-row items-center p-1">
                            <input
                              id={property?.propertyName}
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary"
                              checked={filters.propertyNames.includes(property.propertyName)}
                              onChange={() => {
                                setFilters((prevFilters) => {
                                  const currentProperties = prevFilters.propertyNames;
                                  const propertyIndex = currentProperties.indexOf(property.propertyName);

                                  let updatedProperties;

                                  if (propertyIndex === -1) {
                                    updatedProperties = [...currentProperties, property.propertyName];
                                  } else {
                                    updatedProperties = currentProperties.filter(
                                      (name) => name !== property.propertyName
                                    );
                                  }

                                  return { ...prevFilters, propertyNames: updatedProperties, page: 1 };
                                });
                              }}
                            />
                            <div
                              onClick={() =>
                                setFilters((prevFilters) => ({ ...prevFilters, propertyName: property.propertyName }))
                              }
                            >
                              {property.readablePropertyName}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </th>
                <th>Value</th>
                <th>
                  Anomaly
                  <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-xs bg-base-100 text-base-content border-none">
                      <FaFilter size={24} />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-200 text-base-content rounded-box z-10 w-52 p-2 shadow-sm"
                    >
                      <li>
                        <a onClick={() => setFilters((prevFilters) => ({ ...prevFilters, isAnomaly: null }))}>
                          Select all
                        </a>
                      </li>

                      <li>
                        <a onClick={() => setFilters((prevFilters) => ({ ...prevFilters, isAnomaly: true }))}>
                          Anomalous
                        </a>
                      </li>
                      <li>
                        <a onClick={() => setFilters((prevFilters) => ({ ...prevFilters, isAnomaly: false }))}>
                          Non-Anomalous
                        </a>
                      </li>
                    </ul>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-base-200 text-base-content">
              {archiveData &&
                archiveData.length > 0 &&
                archiveData?.map((entry, index) => (
                  <tr key={index}>
                    <th>{entry.id}</th>
                    <td>{formatTimestamp(entry.timestamp)}</td>
                    <td>{entry.gensetProperty.readablePropertyName}</td>
                    <td>
                      {entry.propertyValue} {entry.gensetProperty.physicalQuantity.unitSymbol}
                    </td>
                    <td>{entry.isAnomaly ? "Yes" : "No"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="join flex justify-between items-center m-2">
        <div></div>
        <div className="join-item text-base-content">
          Page {filters.page} / {paginationMetadata?.lastPage}
        </div>
        <div className="join gap-3">
          <button
            onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: prevFilters.page - 1 }))}
            className={`join-item btn rounded-r-none rounded-l-lg ${
              paginationMetadata?.firstPage === filters.page ? "btn-disabled" : "text-base-content"
            } `}
          >
            <MdKeyboardArrowLeft size={24} />
          </button>
          <button
            onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: prevFilters.page + 1 }))}
            className={`join-item btn rounded-l-none rounded-r-lg ${
              paginationMetadata?.lastPage === filters.page ? "btn-disabled" : "text-base-content"
            } `}
          >
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Archive;
