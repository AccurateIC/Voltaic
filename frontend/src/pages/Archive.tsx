import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DateTime } from "luxon";
import {FaFileExport, FaFilter } from "react-icons/fa6";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { useMessageBus } from "../lib/MessageBus";
import { formatTimestamp } from "../lib/Utils";
import * as XLSX from "xlsx";
import "cally";

const Archive = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    propertyNames: [],
    isAnomaly: null,
    from: null,
    to: null,
  });

  const [paginationMetadata, setPaginationMetadata] = useState({});

  useEffect(() => {
    console.log(filters);
    fetchArchiveData();
  }, [filters]);

  // useEffect(() => {
  //   console.log("::: meta :::", paginationMetadata);
  // }, [paginationMetadata]);

  // we receive message on this bus if archive table updates
  useMessageBus("archive", (msg) => {
    // console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await fetchArchiveData();
    })();
  });

  const excelify = (data) => {
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

  // export all the filtered data to excel without pagination
  const handleExportToExcel = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getPropertyDataBetween`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          from: filters.from,
          to: filters.to,
          properties: filters.propertyNames,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch filtered data");
      }

      const data = await response.json();

      // pass this data to form the excel file
      excelify(data);
      toast.info("Data successfully exported to excel.");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArchiveData = async () => {
    try {
      setIsLoading(true);
      const requestFilters = {
        ...filters,
        from: filters.from ? DateTime.fromISO(filters.from).toUTC().toISO() : null,
        to: filters.to ? DateTime.fromISO(filters.to).toUTC().toISO() : null,
      };
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getPaginated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestFilters),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch archive data");
      }
      const data = await response.json();
      console.log("::: archive :::", data);
      setArchiveData(data?.data);
      setPaginationMetadata(data?.meta);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching archive data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveData();
  }, []);

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

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      propertyNames: [],
      isAnomaly: null,
      from: null,
      to: null,
    });
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-2xl text-base-content font-semibold flex items-center mb-2">Historical Genset Data</div>
        <div className="flex gap-2 mb-2">
          <button onClick={handleExportToExcel} className="btn btn-primary">
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
                        {gensetProperties.map((property, index) => (
                          <li key={index} className="flex flex-row items-center p-1">
                            <input
                              id={property?.propertyName}
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary"
                              checked={filters.propertyNames.includes(property.propertyName)}
                              onChange={(e) => {
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
        <div className="join-item text-base-200">
          Page {filters.page} / {paginationMetadata.lastPage}
        </div>
        <div className="join gap-3">
          <button
            onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: prevFilters.page - 1 }))}
            className={`join-item btn btn-outline rounded-r-none rounded-l-lg ${
              paginationMetadata.firstPage === filters.page ? "btn-disabled" : "text-base-200"
            } `}>
            <MdKeyboardArrowLeft size={24} />
          </button>
          <button
            onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: prevFilters.page + 1 }))}
            className={`join-item btn btn-outline rounded-l-none rounded-r-lg ${
              paginationMetadata.lastPage === filters.page ? "btn-disabled" : "text-base-200"
            } `}>
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Archive;
