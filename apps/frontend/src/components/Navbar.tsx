// frontend/src/components/Navbar.tsx
import { useRef } from "react";
import { useEffect, useState } from "react";
import { BACKEND_BASE_URL } from "../config/backend";
import { CiBellOn } from "react-icons/ci";
import Profile from "./Profile";
// import Logo from "../assets/accurate.svg";

import { toast } from "sonner";


import { cn, formatTimestamp } from "../lib/Utils";
import { tuyau } from "../lib/Tuyau";
import { MaintenanceModal } from "./MaintenanceModal";
import { AnomaliesModal } from "./AnomaliesModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransmit } from "../hooks/useTransmit";
const primaryTab = { ANOMALIES: "Anomalies", MAINTENANCE: "Maintenance" } as const;

const secondaryTab = { RESOLVED: "Resolved", UNRESOLVED: "Unresolved" } as const;

const Navbar = () => {
  const queryClient = useQueryClient();
  // ✅ LIGHTWEIGHT COUNT QUERY — self-polls every 10s, tiny 50-byte response.
  // NOT triggered by SSE invalidation (which caused the same spam bug as summary).
  // refetchInterval drives the update; staleTime matches so no extra fetches fire.
  const { data: notificationCount } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_BASE_URL}/notification/count`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch notification count");
      return res.json() as Promise<{ anomaly: number; maintenance: number }>;
    },
    staleTime: 9000,          // stay fresh for 9s — matches refetchInterval
    refetchInterval: 10000,   // ✅ polls every 10s — only update trigger
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  // ✅ FULL SUMMARY QUERY — enabled:false means it NEVER auto-fetches.
  // Only triggered manually via refetchSummary() when the dropdown opens.
  const {
    data: notificationsSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["notifications-summary"],
    queryFn: () => tuyau.notification.summary.$get().unwrap(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
    enabled: false, // ✅ never auto-fetches — only fetched when dropdown opens
  });

  const resolvedAnomalyNotificationsData = notificationsSummary?.anomaly?.resolved ?? [];
  const unresolvedAnomalyNotificationsData = notificationsSummary?.anomaly?.unresolved ?? [];
  const pdmResolvedNotifications = notificationsSummary?.maintenance?.resolved ?? [];
  const pdmUnresolvedNotifications = notificationsSummary?.maintenance?.unresolved ?? [];

  // ✅ Bell badge counts: prefer real-time count query; fall back to summary array length
  // This ensures the badge updates every 5 seconds via SSE even without opening the dropdown
  const unresolvedAnomalyCount = notificationCount?.anomaly ?? unresolvedAnomalyNotificationsData.length;
  const unresolvedMaintenanceCount = notificationCount?.maintenance ?? pdmUnresolvedNotifications.length;

  // ✅ CORRECT: Call mutations at top level (not in event handlers!)
const markNotificationAsReadMutation = useMutation({
  mutationKey: ["anomaly", "notification", "read"],
  mutationFn: (notificationId: string) => tuyau.notification.read({ id: notificationId }).$patch(),
  onSuccess: (_, notificationId) => {
    queryClient.setQueryData(["notifications-summary"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        anomaly: {
          ...old.anomaly,
          unresolved: old.anomaly.unresolved.filter((n: any) => n.id !== notificationId),
          resolved: [...old.anomaly.resolved, 
            old.anomaly.unresolved.find((n: any) => n.id === notificationId)
          ].filter(Boolean),
        },
      };
    });
  },
});

  const markPdmNotificationAsReadMutation = useMutation({
  mutationKey: ["pdm", "notification", "read"],
  mutationFn: (pdmNotificationId: string) => tuyau.pdm.notification.read({ id: pdmNotificationId }).$patch(),
  onSuccess: (_, pdmNotificationId) => {
    queryClient.setQueryData(["notifications-summary"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        maintenance: {
          ...old.maintenance,
          unresolved: old.maintenance.unresolved.filter((n: any) => n.id !== pdmNotificationId),
          resolved: [...old.maintenance.resolved,
            old.maintenance.unresolved.find((n: any) => n.id === pdmNotificationId)
          ].filter(Boolean),
        },
      };
    });
  },
});

  const [activeTab, setActiveTab] = useState(primaryTab.ANOMALIES);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState(secondaryTab.UNRESOLVED);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showAnomaliesModal, setShowAnomaliesModal] = useState(false);

  
 
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

  
  const handleMarkPdmNotificationAsRead = (pdmNotificationId: string) => {
    markPdmNotificationAsReadMutation.mutate(pdmNotificationId, {
      onSuccess: () => {
        toast.success("Maintenance alert resolved!");
      },
      onError: (error: any) => {
        toast.error(error?.message || `Failed to resolve notification`);
      },
    });
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    markNotificationAsReadMutation.mutate(notificationId, {
      onSuccess: () => {
        toast.success("Anomaly resolved!");
      },
      onError: (error: any) => {
        toast.error(error?.message || `Failed to resolve notification`);
      },
    });
  };
  // ✅ NEW: Resolve all unresolved anomalies
  const handleResolveAllAnomalies = async () => {
    if (!unresolvedAnomalyNotificationsData || unresolvedAnomalyNotificationsData.length === 0) {
      toast.info("No unresolved anomalies");
      return;
    }

    try {
      toast.loading(`Resolving ${unresolvedAnomalyNotificationsData.length} anomalies...`);

      for (const notification of unresolvedAnomalyNotificationsData) {
        await new Promise((resolve) => {
          markNotificationAsReadMutation.mutate(notification.id, {
            onSuccess: () => resolve(null),
            onError: () => resolve(null),
          });
        });
      }

   toast.success("All anomalies resolved!");
      refetchSummary(); // only refetch once after ALL are done, not per notification
    } catch (error: any) {
      toast.error("Failed to resolve all anomalies");
    }
  };

  // ✅ NEW: Resolve all unresolved PDM notifications
  const handleResolveAllPdm = async () => {
    if (!pdmUnresolvedNotifications || pdmUnresolvedNotifications.length === 0) {
      toast.info("No unresolved maintenance alerts");
      return;
    }

    try {
      toast.loading(`Resolving ${pdmUnresolvedNotifications.length} maintenance alerts...`);

      for (const notification of pdmUnresolvedNotifications) {
        await new Promise((resolve) => {
          markPdmNotificationAsReadMutation.mutate(notification.id, {
            onSuccess: () => resolve(null),
            onError: () => resolve(null),
          });
        });
      }

      toast.success("All maintenance alerts resolved!");
      refetchSummary(); // only refetch once after ALL are done
    } catch (error: any) {
      toast.error("Failed to resolve all maintenance alerts");
    }
  };

  // ✅ NEW: Clear resolved anomaly records by period
  const handleClearAnomalyRecords = async (period: string) => {
    try {
      const toastId = toast.loading(`Clearing anomaly records from last ${period}...`);

      // API call to clear records
      const response = await fetch(`http://localhost:3333/notification/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ period }),
      });

      if (response.ok) {
        toast.success(`Cleared anomaly records from last ${period}!`, { id: toastId });
        refetchSummary();
        setShowAnomaliesModal(false);
      } else {
        toast.error("Failed to clear records", { id: toastId });
      }
    } catch (error: any) {
      toast.error(`Error: ${error?.message}`);
    }
  };

  // ✅ NEW: Clear resolved maintenance records by period
  const handleClearMaintenanceRecords = async (period: string) => {
    try {
      const toastId = toast.loading(`Clearing records from last ${period}...`);

      // API call to clear records
      const response = await fetch(`http://localhost:3333/pdm/notification/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ period }),
      });

      if (response.ok) {
        toast.success(`Cleared records from last ${period}!`, { id: toastId });
        refetchSummary();
        setShowMaintenanceModal(false);
      } else {
        toast.error("Failed to clear records", { id: toastId });
      }
    } catch (error: any) {
      toast.error(`Error: ${error?.message}`);
    }
  };

  return (
    <nav className="bg-base-200 px-2 py-3 flex justify-end items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-3">
        {/* --- DaisyUI Dropdown Structure --- */}
        <details
          ref={detailsRef}
          className="dropdown dropdown-end"
          onToggle={(e) => {
            // ✅ Fetch full summary ONLY when dropdown opens — never on SSE events
            if ((e.target as HTMLDetailsElement).open) {
              refetchSummary();
            }
          }}
        >
          <summary className="btn btn-ghost btn-circle relative">
            <CiBellOn size={24} className="md:w-[32px] md:h-[32px]" />
            {/* ✅ Badge uses real-time count query (updated every 5s via SSE) */}
            {unresolvedAnomalyCount + unresolvedMaintenanceCount > 0 && (
              <div className="badge badge-sm badge-primary absolute top-0 right-4">
                {unresolvedAnomalyCount + unresolvedMaintenanceCount}
              </div>
            )}
          </summary>
          <div className="dropdown-content w-[92vw] sm:w-96 shadow-2xl rounded-box bg-base-100 z-50">
            {/* Dropdown Content */}
            <div
              tabIndex={0}
              className="dropdown-content w-full shadow-2xl rounded-box bg-base-100"
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
                  onDoubleClick={() => setShowAnomaliesModal(true)}
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
                  {unresolvedAnomalyCount > 0 && (
                    <span className="ml-2 badge badge-sm badge-primary">
                      {unresolvedAnomalyCount}
                    </span>
                  )}
                </button>
                <button
                  className={`tab tab-lifted flex-1 text-base-content ${
                    activeTab === primaryTab.MAINTENANCE ? "tab-active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(primaryTab.MAINTENANCE);
                    setActiveSecondaryTab(secondaryTab.UNRESOLVED);
                  }}
                  onDoubleClick={() => setShowMaintenanceModal(true)}
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
                  {unresolvedMaintenanceCount > 0 && (
                    <span className="ml-2 badge badge-sm badge-error">
                      {unresolvedMaintenanceCount}
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
                        <>
                          {/* ✅ NEW: Resolve All button */}
                          <div className="mb-3">
                            <button
                              onClick={handleResolveAllAnomalies}
                              disabled={markNotificationAsReadMutation.isPending}
                              className="btn btn-sm btn-warning w-full"
                            >
                              {markNotificationAsReadMutation.isPending
                                ? "Resolving..."
                                : "Resolve All Anomalies"}
                            </button>
                          </div>

                          {unresolvedAnomalyNotificationsData.map((notification) => (
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
                                        disabled={markNotificationAsReadMutation.isPending}
                                        className="btn btn-xs w-full btn-error"
                                      >
                                        {markNotificationAsReadMutation.isPending ? "..." : "Resolve"}
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
                          ))}
                        </>
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
                        <p>No new unresolved maintenance alerts</p>
                      </div>
                    ) : (
                      <>
                        {/* ✅ NEW: Resolve All button */}
                        <div className="mb-3">
                          <button
                            onClick={handleResolveAllPdm}
                            disabled={markPdmNotificationAsReadMutation.isPending}
                            className="btn btn-sm btn-warning w-full"
                          >
                            {markPdmNotificationAsReadMutation.isPending ? "Resolving..." : "Resolve All Maintenance"}
                          </button>
                        </div>

                        {pdmUnresolvedNotifications.map((pdmNotif) => (
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
                                    disabled={markPdmNotificationAsReadMutation.isPending}
                                    className="btn btn-xs btn-error w-full"
                                  >
                                    {markPdmNotificationAsReadMutation.isPending ? "..." : "Resolve"}
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
                        ))}
                      </>
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
            </div>
          </div>
        </details>

        <Profile />
      </div>

      {/* Anomalies Modal */}
      <AnomaliesModal
        isOpen={showAnomaliesModal}
        unresolved={(unresolvedAnomalyNotificationsData || []).length}
        resolved={(resolvedAnomalyNotificationsData || []).length}
        onClose={() => setShowAnomaliesModal(false)}
        onClear={handleClearAnomalyRecords}
      />

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        unresolved={pdmUnresolvedNotifications.length}
        resolved={pdmResolvedNotifications.length}
        onClose={() => setShowMaintenanceModal(false)}
        onClear={handleClearMaintenanceRecords}
      />
    </nav>
  );
};

export default Navbar;