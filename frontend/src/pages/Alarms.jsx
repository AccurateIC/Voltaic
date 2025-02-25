import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { FaFilter } from "react-icons/fa6";

const Alarms = () => {
  const [notifications, setNotifications] = useState([]); // original notifications
  const [filteredNotifications, setFilteredNotifications] = useState([]); // filtered notifications
  const [isLoading, setIsLoading] = useState(true);
  const [gensetProperties, setGensetProperties] = useState([]);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: new Date().toISOString().split("T")[0],
    property: "Property",
    anomalyStatus: "",
  });

  // apply filters whenever filters or notifications change
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by date range
    if (filters.fromDate) {
      filtered = filtered.filter(
        (notif) => DateTime.fromMillis(parseInt(notif.startedAt)) >= DateTime.fromISO(filters.fromDate)
      );
    }
    if (filters.toDate) {
      filtered = filtered.filter(
        (notif) => DateTime.fromMillis(parseInt(notif.startedAt)) <= DateTime.fromISO(filters.toDate).endOf("day")
      );
    }

    // Filter by property
    if (filters.property && filters.property !== "Property") {
      filtered = filtered.filter((notif) => notif.archive.gensetProperty.propertyName === filters.property);
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const dt = DateTime.fromMillis(parseInt(timestamp));
    return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
  };

  useMessageBus("notifications", (msg) => {
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
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      console.log("Fetched data:", data);
      setNotifications(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching data");
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
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/property/getAll`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        console.log("Fetched data (genset properties):", data);
        setGensetProperties(data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error fetching data");
      }
    };
    fetchProperties();
  }, []);

  const handleFromDateFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, fromDate: event.target.value }));
  };

  const handleToDateFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, toDate: event.target.value }));
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: new Date().toISOString().split("T")[0],
      property: "Property",
      anomalyStatus: "",
    });
  };

  const handleAnomalyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, anomalyStatus: event.target.value }));
  };

  const handleGensetPropertyFilterChange = (event) => {
    setFilters((prevFilters) => ({ ...prevFilters, property: event.target.value }));
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
          <select
            className="select select-neutral text-base-content"
            value={filters.property}
            onChange={handleGensetPropertyFilterChange}>
            <option value="Property">Property</option>
            {gensetProperties.map((property, index) => (
              <option key={index} value={property.propertyName}>
                {property.propertyName}
              </option>
            ))}
          </select>

          {/* Anomaly Status */}
          <select
            className="select select-neutral text-base-content"
            value={filters.anomalyStatus}
            onChange={handleAnomalyFilterChange}>
            <option value="">Anomaly Status</option>
            <option value="Resolved">Resolved</option>
            <option value="Unresolved">Unresolved</option>
          </select>
        </div>

        <button className="btn btn-primary btn-outline text-base-200 font-semibold" onClick={handleResetFilters}>
          Reset
        </button>
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
              <th>Anomaly Status</th>
              <th>Finished At</th>
            </tr>
          </thead>
          <tbody className="bg-sky-950/50">
            {filteredNotifications.map((entry, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{formatTimestamp(entry.startedAt)}</td>
                <td>{entry.summary}</td>
                <td>{entry.message}</td>
                <td>{entry.shouldBeDisplayed ? "Unresolved" : "Resolved"}</td>
                <td>{entry.finishedAt !== null ? formatTimestamp(entry.finishedAt) : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alarms;
