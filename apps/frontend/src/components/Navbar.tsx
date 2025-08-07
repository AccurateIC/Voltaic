// frontend/src/components/Navbar.tsx
import { useRef } from "react";
import { useEffect, useState } from "react";
import { CiBellOn } from "react-icons/ci";
import Profile from "./Profile";
// import Logo from "../assets/accurate.svg";
import { TransmitChannels } from "../lib/TransmitChannels";
import { toast } from "sonner";
import { useMessageBus } from "../lib/MessageBus";
import transmitConnection from "../lib/TransmitConnection";
import { cn, formatTimestamp } from "../lib/Utils";
import { LiaConnectdevelop } from "react-icons/lia";
import { tuyau } from "../lib/Tuyau";
import { useMutation, useQuery } from "@tanstack/react-query";

const primaryTab = { ANOMALIES: "Anomalies", MAINTENANCE: "Maintenance" } as const;

const secondaryTab = { RESOLVED: "Resolved", UNRESOLVED: "Unresolved" } as const;

const Navbar = () => {
  // resolved notifs
  const {
    data: resolvedAnomalyNotificationsData,
    error: resolvedAnomalynotificationsError,
    isLoading: resolvedAnomalyNotificationsIsLoading,
  } = useQuery({
    queryKey: ["anomaly-notification", "resolved"],
    queryFn: () => tuyau.notification.getResolved.$get().unwrap(),
  });

  // unresolved notifs
  const {
    data: unresolvedAnomalyNotificationsData,
    error: unresolvedAnomalynotificationsError,
    isLoading: unresolvedAnomalyNotificationsIsLoading,
  } = useQuery({
    queryKey: ["anomaly-notification", "unresolved"],
    queryFn: () => tuyau.notification.getUnresolved.$get().unwrap(),
  });

  // resolved pdm notifications
  const {
    data: pdmResolvedNotifications = [],
    error: pdmResolvedNotificationsError,
    isLoading: pdmResolvedNotificationsIsLoading,
  } = useQuery({
    queryKey: ["pdm", "notification", "resolved"],
    queryFn: () => tuyau.pdm.notification.getResolved.$get().unwrap(),
  });

  // unresolved pdm notifications
  const {
    data: pdmUnresolvedNotifications = [],
    error: pdmUnresolvedNotificationsError,
    isLoading: pdmUnresolvedNotificationsIsLoading,
  } = useQuery({
    queryKey: ["pdm", "notification", "unresolved"],
    queryFn: () => tuyau.pdm.notification.getUnresolved.$get().unwrap(),
  });

  const [activeTab, setActiveTab] = useState(primaryTab.ANOMALIES);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState(secondaryTab.UNRESOLVED);

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

    // re fetch data when new data is inserted in db
    const notificationUnsubscribe = notificationSubscription.onMessage(async () => {
      // React Query will automatically refetch when data changes
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
        // React Query will automatically refetch when data changes
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

  const handleMarkPdmNotificationAsRead = async (pdmNotificationId: string) => {
    try {
      // make req to backend to mark notification as read
      const { mutate, data, isError, error } = useMutation({
        mutationKey: ["pdm", "notification", "read"],
        mutationFn: (pdmNotificationId: string) => tuyau.pdm.notification.read({ id: pdmNotificationId }).$patch(),
      });

      mutate(pdmNotificationId);

      if (isError) {
        toast.error(error.message || `Failed to resolve pdm notification`);
        return;
      }

      // send message on the notification bus to inform other components
      notificationMessageBus({
        time: Date.now(),
        message: "pdm notification marked as read",
        notificationId: pdmNotificationId,
      });

      // React Query will automatically refetch when data changes
    } catch (err) {
      console.error("Error resolving notification:", err);
      toast.error(`Failed to resolve notification: ${err?.message}`);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      // make req to backend to mark notification as read
      const { mutate, data, isError, isLoading, error } = useMutation({
        mutationKey: ["anomaly", "notification", "read"],
        mutationFn: (notificationId: string) => tuyau.notification.read({ id: notificationId }).$patch(),
      });

      mutate(notificationId);

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
    <nav className="bg-base-200 px-4 py-2 flex justify-between items-center">
      {/* navigate to engine page */}
      <div
        className="flex items-center justify-center space-x-2 w-50 cursor-pointer"
        onClick={() => window.location.replace("/engine")}
      >
        {/* <img src={Logo} alt="AccurateIC Logo" className="w-40" /> */}
        <LiaConnectdevelop size={40} />
        <span className="text-2xl">NeuroGen</span>
      </div>

      <div className="flex items-center space-x-3">
        {/* --- DaisyUI Dropdown Structure --- */}
        <details ref={detailsRef} className="dropdown dropdown-end">
          <summary className="btn btn-ghost btn-circle relative">
            <CiBellOn size={38} />
            {(resolvedAnomalyNotificationsData?.length || 0) +
              (unresolvedAnomalyNotificationsData?.length || 0) +
              pdmResolvedNotifications.length +
              pdmUnresolvedNotifications.length >
              0 && (
              <div className="badge badge-sm badge-primary absolute top-0 right-4">
                {(resolvedAnomalyNotificationsData?.length || 0) +
                  (unresolvedAnomalyNotificationsData?.length || 0) +
                  pdmResolvedNotifications.length +
                  pdmUnresolvedNotifications.length}
              </div>
            )}
          </summary>
          <div className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100">
            {/* Dropdown Content */}
            <div
              tabIndex={0}
              className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100"
              onClick={(e) => e.stopPropagation()}
              data-modal="true"
            >
              {/* Tabs */}
              <div className="tabs tabs-bordered px-2">
                <button
                  className={`tab tab-lifted flex-1 text-base-content ${
                    activeTab === primaryTab.ANOMALIES ? "tab-active " : ""
                  }`}
                  onClick={() => setActiveTab(primaryTab.ANOMALIES)}
                >
                  <p
                    className={` ${
                      activeTab === primaryTab.ANOMALIES
                        ? "underline underline-offset-4 decoration-primary decoration-solid decoration-2 transition-all duration-200 ease-in-out"
                        : ""
                    }`}
                  >
                    {primaryTab.ANOMALIES}
                  </p>
                  {(resolvedAnomalyNotificationsData?.length || 0) + (unresolvedAnomalyNotificationsData?.length || 0) >
                    0 && (
                    <span className="ml-2 badge badge-sm badge-primary">
                      {(resolvedAnomalyNotificationsData?.length || 0) +
                        (unresolvedAnomalyNotificationsData?.length || 0)}
                    </span>
                  )}
                </button>
                <button
                  className={`tab tab-lifted flex-1 text-base-content ${activeTab === primaryTab.MAINTENANCE ? "tab-active" : ""}`}
                  onClick={() => {
                    setActiveTab(primaryTab.MAINTENANCE);
                    setActiveSecondaryTab(secondaryTab.UNRESOLVED);
                  }}
                >
                  <p
                    className={` ${
                      activeTab === primaryTab.MAINTENANCE
                        ? "underline underline-offset-4 decoration-error decoration-solid decoration-2 transition-all duration-200 ease-in-out"
                        : ""
                    }`}
                  >
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
                  className={cn("tab flex-1", activeSecondaryTab === secondaryTab.UNRESOLVED ? "tab-active" : "")}
                >
                  {secondaryTab.UNRESOLVED}
                </a>
                <a
                  onClick={() => {
                    setActiveSecondaryTab(secondaryTab.RESOLVED);
                  }}
                  role="tab"
                  className={cn("tab flex-1", activeSecondaryTab === secondaryTab.RESOLVED ? "tab-active" : "")}
                >
                  {secondaryTab.RESOLVED}
                </a>
              </div>

              {/* Notifications Content */}
              <div className="max-h-[400px] overflow-y-auto">
                {activeTab === primaryTab.ANOMALIES ? (
                  activeSecondaryTab === secondaryTab.UNRESOLVED ? (
                    // anomaly tab + unresolved tab
                    <div className="p-2">
                      {!unresolvedAnomalyNotificationsData || unresolvedAnomalyNotificationsData.length === 0 ? (
                        <div className="text-center py-8 text-base-content/70">
                          <p>No new unresolved anomalies</p>
                        </div>
                      ) : (
                        unresolvedAnomalyNotificationsData.map((notification) => (
                          <div
                            key={notification.id}
                            className="card card-compact bg-base-200 mb-2 hover:bg-base-300 transition-colors"
                          >
                            <div className="card-body">
                              <div className="flex flex-col justify-between items-start gap-2">
                                <div>
                                  <h4 className="card-title text-sm text-base-content">{notification.summary}</h4>
                                  <p className="text-xs text-base-content/70 mt-1">
                                    {formatTimestamp(notification.startedAt)}
                                  </p>
                                  <p className="text-sm mt-2 text-base-content/90">{notification.message}</p>
                                </div>
                                <div className="w-full flex">
                                  {notification.shouldBeDisplayed ? (
                                    <button
                                      onClick={() => handleMarkNotificationAsRead(notification.id)}
                                      className="btn btn-xs w-full btn-error"
                                    >
                                      Resolve
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleMarkNotificationAsRead(notification.id)}
                                      className="btn btn-xs w-full btn-disabled"
                                    >
                                      Resolved
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    // anomaly + resolved
                    <div className="p-2">
                      {!resolvedAnomalyNotificationsData || resolvedAnomalyNotificationsData.length === 0 ? (
                        <div className="text-center py-8 text-base-content/70">
                          <p>No new resolved anomalies</p>
                        </div>
                      ) : (
                        resolvedAnomalyNotificationsData.map((notification) => (
                          <div
                            key={notification.id}
                            className="card card-compact bg-base-200 mb-2 hover:bg-base-300 transition-colors"
                          >
                            <div className="card-body">
                              <div className="flex flex-col justify-between items-start gap-2">
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
                                    className="btn btn-xs btn-error btn-outline w-full"
                                  >
                                    Resolve
                                  </button>
                                )}
                                {!notification.shouldBeDisplayed && (
                                  <button
                                    onClick={() => handleMarkNotificationAsRead(notification.id)}
                                    className="btn btn-xs btn-disabled w-full"
                                  >
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
                          className="card card-compact w-full bg-base-200 mb-2 hover:bg-base-300 transition-colors"
                        >
                          <div className="card-body w-full">
                            <div className="flex flex-col w-full gap-2">
                              <div className="w-full">
                                <h4 className="card-title text-sm text-base-content">Maintenance Prediction Alert</h4>
                                <p className="text-xs text-base-content/70 mt-1">
                                  {formatTimestamp(pdmNotif.timestamp)}
                                </p>
                                <p className="text-sm mt-2 break-words text-base-content/90">
                                  {pdmNotif.maintenanceReason?.accel_x}
                                </p>
                                <p className="flex flex-row gap-2">
                                  <span className="font-semibold">Predicted Dominant Frequency:</span>
                                  <span>{pdmNotif.predictedDominantFrequency} Hz</span>
                                </p>
                                <p className="w-full">
                                  <span className="font-semibold">Normal Frequency:</span> 0.1 ± 0.005 Hz
                                </p>
                                <p>
                                  <span className="font-semibold">Predicted Dominant Amplitude:</span>
                                  {pdmNotif.predictedDominantAmplitude} G units
                                </p>
                                <p className="w-full">
                                  <span className="font-semibold">Normal Amplitude Range:</span> -2 to +2 G units
                                </p>
                              </div>
                              {pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
                                  className="btn btn-xs btn-error w-full"
                                >
                                  Resolve
                                </button>
                              )}
                              {!pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
                                  className="btn btn-xs btn-disabled w-full"
                                >
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
                          className="card card-compact bg-base-200 mb-2 hover:bg-base-300 transition-colors"
                        >
                          <div className="card-body">
                            <div className="flex flex-col justify-between items-start gap-2">
                              <div>
                                <h4 className="card-title text-sm text-base-content">Maintenance Alert</h4>
                                <p className="text-xs text-base-content/70 mt-1">
                                  {formatTimestamp(pdmNotif.timestamp)}
                                </p>
                                <p className="text-sm mt-2 break-words text-base-content/90">
                                  {pdmNotif.maintenanceReason?.accel_x}
                                </p>
                                <p className="flex flex-row gap-2">
                                  <span className="font-semibold">Predicted Dominant Frequency:</span>
                                  <span>{pdmNotif.predictedDominantFrequency}</span>
                                </p>
                                <p className="w-full">
                                  <span className="font-semibold">Normal Frequency:</span> 0.1 Hz
                                </p>
                                <p>
                                  <span className="font-semibold">Predicted Dominant Amplitude:</span>
                                  {pdmNotif.predictedDominantAmplitude}
                                </p>
                                <p className="w-full">
                                  <span className="font-semibold">Normal Amplitude Range:</span> -2 to +2 G units
                                </p>
                              </div>
                              {pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
                                  className="btn btn-xs btn-error w-full"
                                >
                                  Resolve
                                </button>
                              )}
                              {!pdmNotif.shouldBeDisplayed && (
                                <button
                                  onClick={() => handleMarkPdmNotificationAsRead(pdmNotif.id)}
                                  className="btn btn-xs btn-disabled w-full"
                                >
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
