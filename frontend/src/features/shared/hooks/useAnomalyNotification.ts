// frontend/src/hooks/anomalies/useAnomalyNotification.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { anomalyNotificationsApi } from "../api/anomalyNotification";
import { toast } from "sonner";

export const QUERY_KEYS = {
  anomalyNotifications: ["anomaly-notifications"] as const,
  resolvedAnomalies: ["resolved-anomalies"] as const,
  unresolvedAnomalies: ["unresolved-anomalies"] as const,
};

export function useAnomalyNotification() {
  const queryClient = useQueryClient();

  const getAllAnomalies = useQuery({
    queryKey: QUERY_KEYS.anomalyNotifications,
    queryFn: anomalyNotificationsApi.getAll,
  });

  const getResolvedAnomalies = useQuery({
    queryKey: QUERY_KEYS.resolvedAnomalies,
    queryFn: anomalyNotificationsApi.getResolved,
    select: (data) => data.slice(0, 5), // Limit to the first 5 resolved notifications
  });

  const getUnresolvedAnomalies = useQuery({
    queryKey: QUERY_KEYS.unresolvedAnomalies,
    queryFn: anomalyNotificationsApi.getUnresolved,
    select: (data) => data.slice(0, 5), // Limit to the first 5 resolved notifications
  });

  const markAnomaliesRead = useMutation({
    mutationFn: anomalyNotificationsApi.read,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.resolvedAnomalies,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.unresolvedAnomalies,
      });
    },
    onError: (error) => {
      toast.error(`Failed to mark anomaly as resolved: ${error.message}`);
    },
  });

  return {
    getAllAnomalies,
    getResolvedAnomalies,
    getUnresolvedAnomalies,
    markAnomaliesRead,
    totalAnomalyCount: (getResolvedAnomalies.data?.length ?? 0) + (getUnresolvedAnomalies.data?.length ?? 0),
  };
}
