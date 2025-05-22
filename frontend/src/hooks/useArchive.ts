// frontend/src/hooks/anomalies/useAnomalyNotification.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { archiveApi } from "../api/archive";

export const QUERY_KEYS = {
  anomalyStatistics: ["anomaly-statistics"] as const,
  propertyDataBetween: ["property-data-between"] as const,
};

export function useArchive() {
  const getAnomalyStatistics = useQuery({
    queryKey: QUERY_KEYS.anomalyStatistics,
    queryFn: archiveApi.getAnomalyStatistics,
  });

  const getPropertyDataBetween = useMutation({
    mutationFn: archiveApi.getPropertyDataBetween,
    mutationKey: QUERY_KEYS.propertyDataBetween,
    onSuccess: (data) => {},
  });

  return {
    getAnomalyStatistics,
    getPropertyDataBetween,
  };
}
