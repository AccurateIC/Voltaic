// frontend/src/components/Navbar.tsx
import { useRef, useEffect, useState } from "react";
import { CiBellOn } from "react-icons/ci";
import { LiaConnectdevelop } from "react-icons/lia";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import Profile from "./Profile";
import { TransmitChannels } from "../lib/TransmitChannels";
import { useMessageBus } from "../lib/MessageBus";
import transmitConnection from "../lib/TransmitConnection";
import { cn, formatTimestamp } from "../lib/Utils";
import { tuyau } from "../lib/Tuyau";

// Constants
const PRIMARY_TAB = { ANOMALIES: "Anomalies", MAINTENANCE: "Maintenance" } as const;
const SECONDARY_TAB = { RESOLVED: "Resolved", UNRESOLVED: "Unresolved" } as const;

// Query keys
const QUERY_KEYS = {
  ANOMALY_NOTIFICATION: {
    RESOLVED: ["notification", "anomaly", "resolved"] as const,
    UNRESOLVED: ["notification", "anomaly", "unresolved"] as const,
    ALL: ["notification", "anomaly"] as const,
  },
  PDM_NOTIFICATION: {
    RESOLVED: ["notification", "pdm", "resolved"] as const,
    UNRESOLVED: ["notification", "pdm", "unresolved"] as const,
    ALL: ["notification", "pdm"] as const,
  },
} as const;

// Types
type PrimaryTab = (typeof PRIMARY_TAB)[keyof typeof PRIMARY_TAB];
type SecondaryTab = (typeof SECONDARY_TAB)[keyof typeof SECONDARY_TAB];

interface NotificationCounts {
  anomaly: { resolved: number; unresolved: number; total: number };
  pdm: { resolved: number; unresolved: number; total: number };
  total: number;
}

// Custom hook for notification queries
const useNotificationQueries = () => {
  const resolvedAnomalyQuery = useQuery({
    queryKey: QUERY_KEYS.ANOMALY_NOTIFICATION.RESOLVED,
    queryFn: () => tuyau.notification.getResolved.$get().unwrap(),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const unresolvedAnomalyQuery = useQuery({
    queryKey: QUERY_KEYS.ANOMALY_NOTIFICATION.UNRESOLVED,
    queryFn: () => tuyau.notification.getUnresolved.$get().unwrap(),
    staleTime: 30000,
  });

  const resolvedPdmQuery = useQuery({
    queryKey: QUERY_KEYS.PDM_NOTIFICATION.RESOLVED,
    queryFn: () => tuyau.pdm.notification.getResolved.$get().unwrap(),
    staleTime: 30000,
  });

  const unresolvedPdmQuery = useQuery({
    queryKey: QUERY_KEYS.PDM_NOTIFICATION.UNRESOLVED,
    queryFn: () => tuyau.pdm.notification.getUnresolved.$get().unwrap(),
    staleTime: 30000,
  });

  return {
    anomaly: { resolved: resolvedAnomalyQuery, unresolved: unresolvedAnomalyQuery },
    pdm: { resolved: resolvedPdmQuery, unresolved: unresolvedPdmQuery },
  };
};

// Custom hook for notification mutations
const useNotificationMutations = () => {
  const queryClient = useQueryClient();
  const notificationMessageBus = useMessageBus(TransmitChannels.NOTIFICATION);

  const anomalyMutation = useMutation({
    mutationKey: ["notification", "anomaly", "resolve"],
    mutationFn: (notificationId: string) => tuyau.notification.read({ id: notificationId }).$patch(),
    onSuccess: async (_, notificationId) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANOMALY_NOTIFICATION.ALL });
      notificationMessageBus({ time: Date.now(), message: "anomaly notification resolved", notificationId });
    },
    onError: (error) => {
      console.error("Failed to resolve anomaly notification:", error);
      toast.error(error.message || "Failed to resolve notification");
    },
  });

  const pdmMutation = useMutation({
    mutationKey: ["notification", "pdm", "resolve"],
    mutationFn: (notificationId: string) => tuyau.pdm.notification.read({ id: notificationId }).$patch(),
    onSuccess: async (_, notificationId) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PDM_NOTIFICATION.ALL });
      notificationMessageBus({ time: Date.now(), message: "pdm notification resolved", notificationId });
    },
    onError: (error) => {
      console.error("Failed to resolve PDM notification:", error);
      toast.error(error.message || "Failed to resolve maintenance notification");
    },
  });

  return { anomaly: anomalyMutation, pdm: pdmMutation };
};

// Custom hook for real-time subscriptions
const useRealtimeSubscriptions = () => {
  const queryClient = useQueryClient();
  const archiveMessageBus = useMessageBus(TransmitChannels.ARCHIVE);
  const notificationMessageBus = useMessageBus(TransmitChannels.NOTIFICATION);
  const pdmMessageBus = useMessageBus(TransmitChannels.PDM);

  useEffect(() => {
    const transmit = transmitConnection;
    let subscriptions: Array<{ unsubscribe: () => void; name: string }> = [];

    const setupSubscriptions = async () => {
      try {
        // Create subscriptions
        const notificationSub = transmit.subscription(TransmitChannels.NOTIFICATION);
        const archiveSub = transmit.subscription(TransmitChannels.ARCHIVE);
        const pdmSub = transmit.subscription(TransmitChannels.PDM);

        await Promise.all([notificationSub.create(), archiveSub.create(), pdmSub.create()]);

        console.log("All subscriptions created successfully");

        // Set up message handlers
        const notificationUnsubscribe = notificationSub.onMessage(async (message) => {
          try {
            console.log("New anomaly notification:", message);
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANOMALY_NOTIFICATION.ALL });
            notificationMessageBus({ time: Date.now(), message: "new anomaly notification received" });
          } catch (error) {
            console.error("Error handling anomaly notification:", error);
          }
        });

        const archiveUnsubscribe = archiveSub.onMessage(async () => {
          try {
            archiveMessageBus({ time: Date.now(), message: "data inserted in archive table" });
          } catch (error) {
            console.error("Error handling archive message:", error);
            toast.error("Error updating archive data");
          }
        });

        const pdmUnsubscribe = pdmSub.onMessage(async (message) => {
          try {
            console.log("New PDM data:", message);
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PDM_NOTIFICATION.ALL });
            pdmMessageBus({ time: Date.now(), message: "new pdm data received" });
          } catch (error) {
            console.error("Error handling PDM message:", error);
          }
        });

        subscriptions = [
          { unsubscribe: notificationUnsubscribe, name: "notification" },
          { unsubscribe: archiveUnsubscribe, name: "archive" },
          { unsubscribe: pdmUnsubscribe, name: "pdm" },
        ];
      } catch (error) {
        console.error("Failed to setup subscriptions:", error);
        toast.error("Failed to connect to real-time updates");
      }
    };

    setupSubscriptions();

    return () => {
      subscriptions.forEach(({ unsubscribe, name }) => {
        try {
          unsubscribe();
          console.log(`Unsubscribed from ${name} channel`);
        } catch (error) {
          console.error(`Error unsubscribing from ${name}:`, error);
        }
      });
    };
  }, [queryClient, archiveMessageBus, notificationMessageBus, pdmMessageBus]);
};

// Notification counts calculator
const calculateNotificationCounts = (queries: ReturnType<typeof useNotificationQueries>): NotificationCounts => {
  const anomalyResolved = queries.anomaly.resolved.data?.length || 0;
  const anomalyUnresolved = queries.anomaly.unresolved.data?.length || 0;
  const pdmResolved = queries.pdm.resolved.data?.length || 0;
  const pdmUnresolved = queries.pdm.unresolved.data?.length || 0;

  const anomalyTotal = anomalyResolved + anomalyUnresolved;
  const pdmTotal = pdmResolved + pdmUnresolved;

  return {
    anomaly: { resolved: anomalyResolved, unresolved: anomalyUnresolved, total: anomalyTotal },
    pdm: { resolved: pdmResolved, unresolved: pdmUnresolved, total: pdmTotal },
    total: anomalyTotal + pdmTotal,
  };
};

// Notification item component
interface NotificationItemProps {
  notification: any;
  onResolve: (id: string) => void;
  isResolving: boolean;
  type: "anomaly" | "pdm";
}

const NotificationItem = ({ notification, onResolve, isResolving, type }: NotificationItemProps) => {
  const handleResolve = () => {
    if (!isResolving) {
      onResolve(notification.id);
    }
  };

  if (type === "pdm") {
    return (
      <div className="card card-compact bg-base-200 mb-2 hover:bg-base-300">
        <div className="card-body">
          <div className="flex flex-col gap-2">
            <div>
              <h4 className="card-title text-sm text-base-content">Maintenance Prediction Alert</h4>
              <p className="text-xs text-base-content/70 mt-1">{formatTimestamp(notification.timestamp)}</p>
              <p className="text-sm mt-2 break-words text-base-content/90">{notification.maintenanceReason?.accel_x}</p>
              <div className="space-y-1 mt-2">
                <p className="flex flex-row gap-2">
                  <span className="font-semibold">Predicted Dominant Frequency:</span>
                  <span>{notification.predictedDominantFrequency} Hz</span>
                </p>
                <p>
                  <span className="font-semibold">Normal Frequency:</span> 0.1 ± 0.005 Hz
                </p>
                <p>
                  <span className="font-semibold">Predicted Dominant Amplitude:</span>
                  {notification.predictedDominantAmplitude} G units
                </p>
                <p>
                  <span className="font-semibold">Normal Amplitude Range:</span> -2 to +2 G units
                </p>
              </div>
            </div>
            {notification.shouldBeDisplayed ? (
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className={cn("btn btn-xs w-full", isResolving ? "btn-disabled loading" : "btn-error")}
              >
                {isResolving ? "Resolving..." : "Resolve"}
              </button>
            ) : (
              <button className="btn btn-xs btn-disabled w-full">Resolved</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-compact bg-base-200 mb-2 hover:bg-base-300">
      <div className="card-body">
        <div className="flex flex-col gap-2">
          <div>
            <h4 className="card-title text-sm text-base-content">{notification.summary}</h4>
            <p className="text-xs text-base-content/70 mt-1">{formatTimestamp(notification.startedAt)}</p>
            <p className="text-sm mt-2 text-base-content/90">{notification.message}</p>
          </div>
          {notification.shouldBeDisplayed ? (
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className={cn("btn btn-xs w-full", isResolving ? "btn-disabled loading" : "btn-error")}
            >
              {isResolving ? "Resolving..." : "Resolve"}
            </button>
          ) : (
            <button className="btn btn-xs btn-disabled w-full">Resolved</button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Navbar component
export const Navbar = () => {
  const navigate = useNavigate();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const [activeTab, setActiveTab] = useState<PrimaryTab>(PRIMARY_TAB.ANOMALIES);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<SecondaryTab>(SECONDARY_TAB.UNRESOLVED);

  // Custom hooks
  const queries = useNotificationQueries();
  const mutations = useNotificationMutations();
  const counts = calculateNotificationCounts(queries);

  // Set up real-time subscriptions
  useRealtimeSubscriptions();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.removeAttribute("open");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Event handlers
  const handleNavigateToEngine = () => {
    navigate("/engine");
  };

  const handleResolveAnomalyNotification = (notificationId: string) => {
    mutations.anomaly.mutate(notificationId);
  };

  const handleResolvePdmNotification = (notificationId: string) => {
    mutations.pdm.mutate(notificationId);
  };

  const handleTabChange = (tab: PrimaryTab) => {
    setActiveTab(tab);
    if (tab === PRIMARY_TAB.MAINTENANCE) {
      setActiveSecondaryTab(SECONDARY_TAB.UNRESOLVED);
    }
  };

  // Get current notifications based on active tabs
  const getCurrentNotifications = () => {
    if (activeTab === PRIMARY_TAB.ANOMALIES) {
      return activeSecondaryTab === SECONDARY_TAB.UNRESOLVED
        ? queries.anomaly.unresolved.data || []
        : queries.anomaly.resolved.data || [];
    } else {
      return activeSecondaryTab === SECONDARY_TAB.UNRESOLVED
        ? queries.pdm.unresolved.data || []
        : queries.pdm.resolved.data || [];
    }
  };

  const currentNotifications = getCurrentNotifications();
  const isLoading =
    queries.anomaly.resolved.isLoading ||
    queries.anomaly.unresolved.isLoading ||
    queries.pdm.resolved.isLoading ||
    queries.pdm.unresolved.isLoading;

  return (
    <nav className="bg-base-200 px-4 py-2 flex justify-between items-center">
      {/* Logo and navigation */}
      <div className="flex items-center justify-center space-x-2 w-50 cursor-pointer" onClick={handleNavigateToEngine}>
        <LiaConnectdevelop size={40} />
        <span className="text-2xl">NeuroGen</span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications dropdown */}
        <details ref={detailsRef} className="dropdown dropdown-end">
          <summary className="btn btn-ghost btn-circle relative">
            <CiBellOn size={38} />
            {counts.total > 0 && (
              <div className="badge badge-sm badge-primary absolute top-0 right-4">{counts.total}</div>
            )}
          </summary>

          <div className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100">
            <div
              tabIndex={0}
              className="dropdown-content w-96 shadow-2xl rounded-box bg-base-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Primary tabs */}
              <div className="tabs tabs-bordered px-2">
                <button
                  className={cn(
                    "tab tab-lifted flex-1 text-base-content",
                    activeTab === PRIMARY_TAB.ANOMALIES && "tab-active"
                  )}
                  onClick={() => handleTabChange(PRIMARY_TAB.ANOMALIES)}
                >
                  <p
                    className={cn(
                      activeTab === PRIMARY_TAB.ANOMALIES &&
                        "underline underline-offset-4 decoration-primary decoration-solid decoration-2"
                    )}
                  >
                    {PRIMARY_TAB.ANOMALIES}
                  </p>
                  {counts.anomaly.total > 0 && (
                    <span className="ml-2 badge badge-sm badge-primary">{counts.anomaly.total}</span>
                  )}
                </button>

                <button
                  className={cn(
                    "tab tab-lifted flex-1 text-base-content",
                    activeTab === PRIMARY_TAB.MAINTENANCE && "tab-active"
                  )}
                  onClick={() => handleTabChange(PRIMARY_TAB.MAINTENANCE)}
                >
                  <p
                    className={cn(
                      activeTab === PRIMARY_TAB.MAINTENANCE &&
                        "underline underline-offset-4 decoration-error decoration-solid decoration-2"
                    )}
                  >
                    {PRIMARY_TAB.MAINTENANCE}
                  </p>
                  {counts.pdm.total > 0 && <span className="ml-2 badge badge-sm badge-error">{counts.pdm.total}</span>}
                </button>
              </div>

              {/* Secondary tabs */}
              <div role="tablist" className="tabs tabs-box tabs-xs">
                <button
                  onClick={() => setActiveSecondaryTab(SECONDARY_TAB.UNRESOLVED)}
                  role="tab"
                  className={cn("tab flex-1", activeSecondaryTab === SECONDARY_TAB.UNRESOLVED && "tab-active")}
                >
                  {SECONDARY_TAB.UNRESOLVED}
                </button>
                <button
                  onClick={() => setActiveSecondaryTab(SECONDARY_TAB.RESOLVED)}
                  role="tab"
                  className={cn("tab flex-1", activeSecondaryTab === SECONDARY_TAB.RESOLVED && "tab-active")}
                >
                  {SECONDARY_TAB.RESOLVED}
                </button>
              </div>

              {/* Notifications content */}
              <div className="max-h-[400px] overflow-y-auto">
                <div className="p-2">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <span className="loading loading-spinner loading-md"></span>
                    </div>
                  ) : currentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-base-content/70">
                      <p>
                        No {activeSecondaryTab.toLowerCase()} {activeTab.toLowerCase()} notifications
                      </p>
                    </div>
                  ) : (
                    currentNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onResolve={
                          activeTab === PRIMARY_TAB.ANOMALIES
                            ? handleResolveAnomalyNotification
                            : handleResolvePdmNotification
                        }
                        isResolving={
                          activeTab === PRIMARY_TAB.ANOMALIES ? mutations.anomaly.isPending : mutations.pdm.isPending
                        }
                        type={activeTab === PRIMARY_TAB.ANOMALIES ? "anomaly" : "pdm"}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </details>

        <Profile />
      </div>
    </nav>
  );
};

export default Navbar;
