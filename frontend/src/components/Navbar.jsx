import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { CiBellOn } from "react-icons/ci";
import Profile from "./Profile";
import Logo from "../assets/accurate.svg";
import { TransmitChannels } from "../lib/TransmitChannels.js";
import { toast } from "sonner";
import { useMessageBus } from "../lib/MessageBus.js";
import transmitConnection from "../lib/TransmitConnection";
import { useRef } from "react";
import { formatTimestamp } from "../lib/Utils.js";

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [pdmNotifications, setPdmNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("anomalies");
  const archiveMessageBus = useMessageBus("archive");
  const notificationMessageBus = useMessageBus("notification");
  const pdmMessageBus = useMessageBus("pdm");
  const detailsRef = useRef(null); // used to close notification dropdown when clicking outside

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        detailsRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // fetch pdm notifications
  const fetchPdmNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/notification/getAllUnread`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to fetch PDM notifications`);
      const data = await response.json();
      setPdmNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  // fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      // if we need only unread notifications & the backend doesnt do the filtering
      // const unreadNotifications = data.filter((element) => element.shouldBeDisplayed === true);

      setNotifications(data.slice(0, 3));
    } catch (error) {
      console.error(error);
      toast.error("Error fetching notifications");
    }
  };

  // fetch anomaly and pdm notifications on first render
  useEffect(() => {
    fetchNotifications();
    fetchPdmNotifications();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    const transmit = transmitConnection;
    const notificationSubscription = transmit.subscription(TransmitChannels.NOTIFICATION);
    const archiveSubscription = transmit.subscription(TransmitChannels.ARCHIVE);
    const pdmSubscription = transmit.subscription(TransmitChannels.PDM);

    (async () => {
      await notificationSubscription.create();
      console.log("Subscribed to notification channel");
      await archiveSubscription.create();
      console.log("Subscribed to archive channel");
      await pdmSubscription.create();
      console.log("Subscribed to pdm channel");
    })();

    const notificationUnsubscribe = notificationSubscription.onMessage(async () => await fetchNotifications());

    const archiveUnsubscribe = archiveSubscription.onMessage(async () => {
      try {
        archiveMessageBus({ time: Date.now(), message: "data inserted in archive table" });
      } catch (error) {
        console.error(error);
        toast.error("Error updating archive");
      }
    });

    const pdmUnsubscribe = pdmSubscription.onMessage(async (message) => {
      try {
        console.log("::::new pdm data:::", message);
        await fetchPdmNotifications();
        pdmMessageBus({ time: Date.now(), message: "new pdm data recieved" });
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      notificationUnsubscribe();
      console.log("Unsubscribed from notification channel");
      archiveUnsubscribe();
      console.log("Unsubscribed from archive channel");
      pdmUnsubscribe();
      console.log("Unsubscribed from pdm channel");
    };
  }, [archiveMessageBus, notificationMessageBus, pdmMessageBus]);

  const handleMarkPdmNotificationAsRead = async (pdmNotificationId) => {
    try {
      // make req to backend to mark notification as read
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/notification/read/${pdmNotificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || `Failed to resolve notification`);
        return;
      }

      // Send message on the notification bus to inform other components
      notificationMessageBus({
        time: Date.now(),
        message: "pdm notification marked as read",
        notificationId: pdmNotificationId,
      });

      // re fetch notifications?
      fetchPdmNotifications();
    } catch (err) {
      console.error("Error resolving notification:", err);
      toast.error(`Failed to resolve notification: ${err.message}`);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      // make req to backend to mark notification as read
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/notification/read/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || `Failed to resolve notification`);
        return;
      }

      // Send message on the notification bus to inform other components
      notificationMessageBus({
        time: Date.now(),
        message: "notification marked as read",
        notificationId: notificationId,
      });

      // re fetch notifications?
      fetchNotifications();
    } catch (err) {
      console.error("Error resolving notification:", err);
      toast.error(`Failed to resolve notification: ${err.message}`);
    }
  };

  return (
    <nav className="bg-[rgba(177,213,189,1)] px-4 py-2 flex justify-between items-center">
      <div>
        <img src={Logo} alt="AccurateIC Logo" className="w-40" />
      </div>

      <div className="flex items-center space-x-3">
        {/* --- DaisyUI Dropdown Structure --- */}
        <details ref={detailsRef} className="dropdown dropdown-end">
          <summary className="btn btn-ghost btn-circle relative">
            <CiBellOn size={38} color="black" />
            {notifications.length + pdmNotifications.length > 0 && (
              <div className="badge badge-sm badge-primary absolute top-0 right-4">
                {notifications.length + pdmNotifications.length}
              </div>
            )}
          </summary>
          <div className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100">
            {/* Your existing dropdown content */}
            {/* Dropdown Content */}
            <div
              tabIndex={0}
              className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100"
              onClick={(e) => e.stopPropagation()}
              data-modal="true">
              {/* Tabs */}
              <div className="tabs tabs-bordered px-2">
                <button
                  className={`tab tab-lifted flex-1 text-base-content ${activeTab === "anomalies" ? "tab-active " : ""}`}
                  onClick={() => setActiveTab("anomalies")}>
                  <p
                    className={` ${activeTab === "anomalies" ? "underline underline-offset-4 decoration-primary decoration-solid decoration-2 transition-all duration-200 ease-in-out" : ""}`}>
                    Anomalies
                  </p>
                  {notifications.length > 0 && (
                    <span className="ml-2 badge badge-sm badge-primary">{notifications.length}</span>
                  )}
                </button>
                <button
                  className={`tab tab-lifted flex-1 text-base-content ${activeTab === "maintenance" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("maintenance")}>
                  <p
                    className={` ${activeTab === "maintenance" ? "underline underline-offset-4 decoration-warning decoration-solid decoration-2 transition-all duration-200 ease-in-out" : ""}`}>
                    Maintenance
                  </p>
                  {pdmNotifications.length > 0 && (
                    <span className="ml-2 badge badge-sm badge-warning">{pdmNotifications.length}</span>
                  )}
                </button>
              </div>
              {/* Notifications Content */}
              <div className="max-h-[400px] overflow-y-auto">
                {activeTab === "anomalies" ? (
                  <div className="p-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-base-content/70">
                        <p>No new anomalies</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="card card-compact bg-base-200 mb-2 hover:bg-base-300 transition-colors">
                          <div className="card-body">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="card-title text-sm text-base-content">{notification.summary}</h4>
                                <p className="text-xs text-base-content/70 mt-1">
                                  {formatTimestamp(notification.startedAt)}
                                </p>
                                <p className="text-sm mt-2 text-base-content/90">{notification.message}</p>
                              </div>
                              {notification.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                                  className="btn btn-xs btn-error btn-outline">
                                  Resolve
                                </button>
                              )}
                              {!notification.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                                  className="btn btn-xs btn-disabled">
                                  Resolved
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-2">
                    {pdmNotifications.length === 0 ? (
                      <div className="text-center py-8 text-base-content/70">
                        <p>No maintenance alerts</p>
                      </div>
                    ) : (
                      pdmNotifications.map((pdmNotif) => (
                        <div
                          key={pdmNotif.id}
                          className="card card-compact bg-base-200 mb-2 hover:bg-base-300 transition-colors">
                          <div className="card-body">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="card-title text-sm text-base-content">Maintenance Alert</h4>
                                <p className="text-xs text-base-content/70 mt-1">{formatTimestamp(pdmNotif.timestamp)}</p>
                                <p className="text-sm mt-2 break-words text-base-content/90">
                                  {pdmNotif.maintenanceReason?.accel_x}
                                </p>
                              </div>
                              <button
                                onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
                                className="btn btn-xs btn-warning btn-outline">
                                Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {/* Footer */}
              {/* <div className="bg-base-200 rounded-b-box p-2 border-t border-base-300">
              <button className="btn btn-ghost btn-sm w-full">View all notifications</button>
            </div> */}
            </div>
          </div>
        </details>

        <Profile />
      </div>
    </nav>
  );
};

export default Navbar;
