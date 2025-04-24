// frontend/src/components/Navbar.tsx
import { useRef } from "react";
import { useEffect, useState } from "react";
import { CiBellOn } from "react-icons/ci";
import Profile from "./Profile";
import Logo from "../assets/accurate.svg";
import { TransmitChannels } from "../lib/TransmitChannels";
import { toast } from "sonner";
import { useMessageBus } from "../lib/MessageBus";
import transmitConnection from "../lib/TransmitConnection";
import { cn, formatTimestamp } from "../lib/Utils";
import { useAnomalyNotification } from "../hooks/anomalies/useAnomalyNotification";

const primaryTab = {
  ANOMALIES: "Anomalies",
  MAINTENANCE: "Maintenance",
} as const;

const secondaryTab = {
  RESOLVED: "Resolved",
  UNRESOLVED: "Unresolved",
} as const;

const Navbar = () => {
  const { getResolvedAnomalies, getUnresolvedAnomalies, markAnomaliesRead, totalAnomalyCount } = useAnomalyNotification();
  const resolvedAnomalies = getResolvedAnomalies.data || [];
  const unresolvedAnomalies = getUnresolvedAnomalies.data || [];

  // const [anomalyResolvedNotifications, setAnomalyResolvedNotifications] = useState([]);
  // const [anomalyUnresolvedNotifications, setAnomalyUnresolvedNotifications] = useState([]);

  const [pdmResolvedNotifications, setPdmResolvedNotifications] = useState([]);
  const [pdmUnresolvedNotifications, setPdmUnresolvedNotifications] = useState([]);

  const [activeTab, setActiveTab] = useState(primaryTab.ANOMALIES);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState(secondaryTab.RESOLVED);

  const archiveMessageBus = useMessageBus(TransmitChannels.ARCHIVE);
  const notificationMessageBus = useMessageBus(TransmitChannels.NOTIFICATION);
  const pdmMessageBus = useMessageBus(TransmitChannels.PDM);
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

  // fetch resolved anomaly notifications
  const fetchResolvedPdmNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/notification/getResolved`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setPdmResolvedNotifications(data.slice(0, 3));
    } catch (error) {
      console.error(error);
      toast.error("Error fetching pdm notifications");
    }
  };

  // fetch unresolved anomaly notifications
  const fetchUnresolvedPdmNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/notification/getUnresolved`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setPdmUnresolvedNotifications(data.slice(0, 3));
    } catch (error) {
      console.error(error);
      toast.error("Error fetching pdm notifications");
    }
  };

  // fetch anomaly and pdm notifications on first render
  useEffect(() => {
    Promise.all([
      fetchResolvedPdmNotifications(),
      fetchUnresolvedPdmNotifications(),
      // getResolvedAnomalies.refetch(),
      // getUnresolvedAnomalies.refetch(),
      // fetchResolvedAnomalyNotifications(),
      // fetchUnresolvedAnomalyNotifications(),
    ]);
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

    const notificationUnsubscribe = notificationSubscription.onMessage(async () => {
      Promise.all([
        fetchResolvedPdmNotifications(),
        fetchUnresolvedPdmNotifications(),
        getResolvedAnomalies.refetch(),
        getUnresolvedAnomalies.refetch(),
        // fetchResolvedAnomalyNotifications(),
        // fetchUnresolvedAnomalyNotifications(),
      ]);
    });

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
        Promise.all([fetchResolvedPdmNotifications(), fetchUnresolvedPdmNotifications()]);
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

      // send message on the notification bus to inform other components
      notificationMessageBus({
        time: Date.now(),
        message: "pdm notification marked as read",
        notificationId: pdmNotificationId,
      });

      // re fetch notifications?
      Promise.all([fetchResolvedPdmNotifications(), fetchUnresolvedPdmNotifications()]);
    } catch (err) {
      console.error("Error resolving notification:", err);
      toast.error(`Failed to resolve notification: ${err.message}`);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await markAnomaliesRead.mutateAsync(notificationId);

      // The mutation will automatically trigger a refetch of the queries
      // No need to manually refetch

      notificationMessageBus({
        time: Date.now(),
        message: "notification marked as read",
        notificationId: notificationId,
      });
    } catch (err) {
      console.error("Error resolving notification:", err);
      // Toast error is handled by the mutation
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
            {totalAnomalyCount + pdmResolvedNotifications.length + pdmUnresolvedNotifications.length > 0 && (
              <div className="badge badge-sm badge-primary absolute top-0 right-4">
                {totalAnomalyCount + pdmResolvedNotifications.length + pdmUnresolvedNotifications.length}
              </div>
            )}
          </summary>
          <div className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100">
            {/* Dropdown Content */}
            <div
              tabIndex={0}
              className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100"
              onClick={(e) => e.stopPropagation()}
              data-modal="true">
              {/* Tabs */}
              <div className="tabs tabs-bordered px-2">
                <button
                  className={`tab tab-lifted flex-1 text-base-content ${
                    activeTab === primaryTab.ANOMALIES ? "tab-active " : ""
                  }`}
                  onClick={() => setActiveTab(primaryTab.ANOMALIES)}>
                  <p
                    className={` ${
                      activeTab === primaryTab.ANOMALIES
                        ? "underline underline-offset-4 decoration-primary decoration-solid decoration-2 transition-all duration-200 ease-in-out"
                        : ""
                    }`}>
                    {primaryTab.ANOMALIES}
                  </p>
                  {totalAnomalyCount > 0 && <span className="ml-2 badge badge-sm badge-primary">{totalAnomalyCount}</span>}
                </button>
                <button
                  className={`tab tab-lifted flex-1 text-base-content ${activeTab === "maintenance" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(primaryTab.MAINTENANCE)}>
                  <p
                    className={` ${
                      activeTab === primaryTab.MAINTENANCE
                        ? "underline underline-offset-4 decoration-error decoration-solid decoration-2 transition-all duration-200 ease-in-out"
                        : ""
                    }`}>
                    {primaryTab.MAINTENANCE}
                  </p>
                  {pdmResolvedNotifications.length + pdmUnresolvedNotifications.length > 0 && (
                    <span className="ml-2 badge badge-sm badge-error">
                      {pdmResolvedNotifications.length + pdmUnresolvedNotifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* READ / UNREAD TABS */}
              <div role="tablist" className="tabs tabs-box tabs-xs">
                <a
                  onClick={() => {
                    setActiveSecondaryTab(secondaryTab.UNRESOLVED);
                  }}
                  role="tab"
                  className={cn("tab flex-1", activeSecondaryTab === secondaryTab.UNRESOLVED ? "tab-active" : "")}>
                  {secondaryTab.UNRESOLVED}
                </a>
                <a
                  onClick={() => {
                    setActiveSecondaryTab(secondaryTab.RESOLVED);
                  }}
                  role="tab"
                  className={cn("tab flex-1", activeSecondaryTab === secondaryTab.RESOLVED ? "tab-active" : "")}>
                  {secondaryTab.RESOLVED}
                </a>
              </div>

              {/* Notifications Content */}
              <div className="max-h-[400px] overflow-y-auto">
                {activeTab === primaryTab.ANOMALIES ? (
                  activeSecondaryTab === secondaryTab.UNRESOLVED ? (
                    // anomaly tab + unresolved tab
                    <div className="p-2">
                      {unresolvedAnomalies.length === 0 ? (
                        <div className="text-center py-8 text-base-content/70">
                          <p>No new unresolved anomalies</p>
                        </div>
                      ) : (
                        unresolvedAnomalies.map((notification) => (
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
                    // anomaly + resolved
                    <div className="p-2">
                      {resolvedAnomalies.length === 0 ? (
                        <div className="text-center py-8 text-base-content/70">
                          <p>No new resolved anomalies</p>
                        </div>
                      ) : (
                        resolvedAnomalies.map((notification) => (
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
                  )
                ) : activeSecondaryTab === secondaryTab.UNRESOLVED ? (
                  // maintenance tab + unresolved tab
                  <div className="p-2">
                    {pdmUnresolvedNotifications.length === 0 ? (
                      <div className="text-center py-8 text-base-content/70">
                        <p>No new resolved maintenance alerts</p>
                      </div>
                    ) : (
                      pdmUnresolvedNotifications.map((pdmNotif) => (
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
                              {pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
                                  className="btn btn-xs btn-error">
                                  Resolve
                                </button>
                              )}
                              {!pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
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
                  // maintenance tab + resolved tab
                  <div className="p-2">
                    {pdmResolvedNotifications.length === 0 ? (
                      <div className="text-center py-8 text-base-content/70">
                        <p>No new resolved maintenance alerts</p>
                      </div>
                    ) : (
                      pdmResolvedNotifications.map((pdmNotif) => (
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
                              {pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
                                  className="btn btn-xs btn-error">
                                  Resolve
                                </button>
                              )}
                              {!pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
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
