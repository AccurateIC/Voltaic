import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaFilter } from "react-icons/fa6";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { useMessageBus } from "../lib/MessageBus";
import { formatTimestamp } from "../lib/Utils";
import * as XLSX from "xlsx";
import "cally";
import { useArchive } from "../hooks/useArchive";
import { type Archive } from "../types/archive.types";
import { GetDataPaginatedFilters, Metadata, PaginatedArchiveData } from "../api/archive";
import { useGensetProperty } from "../hooks/useGensetProperty";

const excelify = (data: Archive[]) => {
  const excelData = data.map((entry, index) => ({
    "Sr No": index + 1,
    ID: entry.id,
    Timestamp: entry.timestamp,
    Property: `${entry.gensetProperty.readablePropertyName}`,
    Value: `${entry.propertyValue}  ${entry.gensetProperty.physicalQuantity.unitSymbol}`,
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);

  const columnWidths = [
    { wch: 5 }, // serial number
    { wch: 5 }, // id
    { wch: 30 }, // timestamp
    { wch: 40 }, // property
    { wch: 8 }, // value
  ];
  ws["!cols"] = columnWidths;

  // create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Genset Data");

  // generate timestamped file
  const fileName = `genset_data_${new Date().toISOString().split("T")[0]}.xlsx`;

  // save
  XLSX.writeFile(wb, fileName);
};

const Archive = () => {
  //hooks
  const { getDataPaginated, getPropertyDataBetween } = useArchive();
  const { getAllGensetProperties } = useGensetProperty();

  // state
  const {
    data: allGensetProperties,
    isError: getAllGensetPropertiesIsError,
    isPending: getAllGensetPropertiesIsPending,
  } = getAllGensetProperties;
  const [archiveData, setArchiveData] = useState<Archive[]>([]);
  const [paginationMetadata, setPaginationMetadata] = useState<Metadata>();
  const [filters, setFilters] = useState<GetDataPaginatedFilters>({
    page: 1,
    propertyNames: [],
    isAnomaly: null,
    from: null,
    to: null,
  });

  useEffect(() => {
    getDataPaginated.mutate(filters, {
      onSuccess: (data: PaginatedArchiveData) => {
        setArchiveData(data.data);
        setPaginationMetadata(data.meta);
      },
      onError: (error) => {
        toast.error(`Failed to fetch archive data: ${error}`);
      },
    });
  }, [filters]);

  // we receive message on this bus if archive table updates
  useMessageBus("archive", () => {
    // console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    getDataPaginated.mutate(filters, {
      onSuccess: (data: PaginatedArchiveData) => {
        setArchiveData(data.data);
        setPaginationMetadata(data.meta);
      },
      onError: (error) => {
        toast.error(`Failed to fetch archive data: ${error}`);
      },
    });
  });

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      propertyNames: [],
      isAnomaly: null,
      from: null,
      to: null,
    });
  };

  /* TODO: handle error and pending states differently */
  if (getAllGensetPropertiesIsError) return <div className="h-full w-full">N/A</div>;
  if (getAllGensetPropertiesIsPending) return <div className="h-full w-full">N/A</div>;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-2xl text-base-content font-semibold flex items-center mb-2">Historical Genset Data</div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() =>
              getPropertyDataBetween.mutate(
                {
                  from: filters.from,
                  to: filters.to,
                  properties: filters.propertyNames.length > 0 ? filters.propertyNames : null,
                },
                {
                  onError: () => {
                    console.error(`Failed to get data for the given filters: ${JSON.stringify(filters)}`);
                  },
                  onSuccess: (data: Archive[]) => {
                    excelify(data);
                    toast.info("Data successfully exported to excel.");
                  },
                }
              )
            }
            className="btn btn-primary">
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
                        value={
                          filters.fromDate !== "" && filters.toDate !== "" ? `${filters.fromDate}/${filters.toDate}` : ""
                        }
                        class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
                        onchange={(event) => {
                          const val = event.target.value;

                          setFilters((prevFilters) => ({
                            ...prevFilters,
                            from: val.split("/")[0],
                            to: val.split("/")[1],
                          }));
                        }}>
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
                      className="dropdown-content z-10 max-h-64 w-56 overflow-y-auto bg-base-100 rounded-box shadow-lg">
                      <ul className="menu menu-compact p-2">
                        <li>
                          <a onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: 1, propertyNames: [] }))}>
                            Select All
                          </a>
                        </li>
                        {allGensetProperties.map((property, index) => (
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
                                    updatedProperties = currentProperties.filter((name) => name !== property.propertyName);
                                  }

                                  return {
                                    ...prevFilters,
                                    propertyNames: updatedProperties,
                                    page: 1,
                                  };
                                });
                              }}
                            />
                            <div
                              onClick={() =>
                                setFilters((prevFilters) => ({ ...prevFilters, propertyName: property.propertyName }))
                              }>
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
                      className="dropdown-content menu bg-base-200 text-base-content rounded-box z-10 w-52 p-2 shadow-sm">
                      <li>
                        <a onClick={() => setFilters((prevFilters) => ({ ...prevFilters, isAnomaly: null }))}>Select all</a>
                      </li>

                      <li>
                        <a onClick={() => setFilters((prevFilters) => ({ ...prevFilters, isAnomaly: true }))}>Anomalous</a>
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
              {archiveData?.map((entry, index) => (
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
            } `}>
            <MdKeyboardArrowLeft size={24} />
          </button>
          <button
            onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: prevFilters.page + 1 }))}
            className={`join-item btn rounded-l-none rounded-r-lg ${
              paginationMetadata?.lastPage === filters.page ? "btn-disabled" : "text-base-content"
            } `}>
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Archive;
