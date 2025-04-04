import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { FaFilter } from "react-icons/fa6";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { useMessageBus } from "../lib/MessageBus";

const Archive = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);

  const [filters, setFilters] = useState({
    page: 1,
    propertyNames: [],
    isAnomaly: null,
  });

  const [paginationMetadata, setPaginationMetadata] = useState({});

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const dt = DateTime.fromISO(timestamp);
    return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  };

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

  const fetchArchiveData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getPaginated`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(filters),
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
    });
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold flex items-center mb-2">Historical Genset Data</div>
        <button onClick={handleResetFilters} className="btn btn-sm btn-outline m-2">
          Reset Filters
        </button>
        <div>
          <button onClick={() => handleExport("excel")} className="btn btn-sm btn-outline m-2">
            Export to Excel
          </button>
        </div>
      </div>
      {/* Notification Table */}
      <div className="flex-1 rounded-box shadow-lg bg-base-content text-base-200 overflow-hidden">
        <div className="overflow-y-auto h-full">
          <table className="table table-pin-rows">
            <thead className="">
              <tr className="bg-sky-950 text-base-200">
                <th>ID</th>
                <th>Timestamp</th>
                <th className="flex gap-2 relative">
                  Property
                  <div className="dropdown dropdown-bottom">
                    <div tabIndex={0} role="button" className="btn btn-xs bg-sky-950 text-base-200 border-none">
                      <FaFilter size={24} />
                    </div>
                    <div
                      tabIndex={0}
                      className="dropdown-content z-10 max-h-64 w-56 overflow-y-auto bg-sky-950 rounded-box shadow-lg">
                      <ul className="menu menu-compact p-2">
                        <li>
                          <a onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: 1, propertyNames: [] }))}>
                            Select All
                          </a>
                        </li>
                        {gensetProperties.map((property, index) => (
                          <li key={index} className="flex flex-row items-center p-1 hover:bg-accent hover:rounded">
                            <input
                              id={property?.propertyName}
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary bg-sky-900 checked:bg-sky-500 checked:text-black"
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
                              {property.propertyName}
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
                    <div tabIndex={0} role="button" className="btn btn-xs bg-sky-950 text-base-200 border-none">
                      <FaFilter size={24} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-sky-950 rounded-box z-10 w-52 p-2 shadow-sm">
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
            <tbody className="bg-sky-950/50">
              {archiveData?.map((entry, index) => (
                <tr key={index}>
                  <th>{entry.id}</th>
                  <td>{formatTimestamp(entry.timestamp)}</td>
                  <td>{entry.gensetProperty.propertyName}</td>
                  <td>{entry.propertyValue}</td>
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
        <div className="join-item">
          Page {filters.page} / {paginationMetadata.lastPage}
        </div>
        <div className="join gap-3">
          <button
            onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: prevFilters.page - 1 }))}
            className={`join-item btn btn-outline rounded-r-none rounded-l-lg ${
              paginationMetadata.firstPage === filters.page ? "btn-disabled" : ""
            } `}>
            <MdKeyboardArrowLeft size={24} />
          </button>
          <button
            onClick={() => setFilters((prevFilters) => ({ ...prevFilters, page: prevFilters.page + 1 }))}
            className={`join-item btn btn-outline rounded-l-none rounded-r-lg ${
              paginationMetadata.lastPage === filters.page ? "btn-disabled" : ""
            } `}>
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Archive;
