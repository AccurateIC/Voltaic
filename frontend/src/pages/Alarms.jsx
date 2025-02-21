import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus";
import { toast } from "sonner";

const Alarms = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await fetchLatestArchiveData();
    })();
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

  useEffect(() => {
    console.log("Engine page mount effect running");
    (async () => {
      await fetchNotifications();
    })();
  }, []);

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table text-base-content">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Time</th>
            <th>Summary</th>
            <th>Anomaly Status</th>
          </tr>
        </thead>
        <tbody>
          {notifications.length > 0 &&
            notifications.forEach((entry) => {
              <tr>
                <th>1</th>
                <td>{entry.startedAt}</td>
                <td>{entry.summary}</td>
                <td>{entry.shouldBeDisplayed}</td>
              </tr>;
            })}
        </tbody>
      </table>
    </div>
  );
};

export default Alarms;
