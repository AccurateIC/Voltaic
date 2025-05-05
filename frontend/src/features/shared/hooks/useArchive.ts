// frontend/src/hooks/anomalies/useAnomalyNotification.ts
import { useQuery } from "@tanstack/react-query";
import { archiveApi } from "../api/archive";

export const QUERY_KEYS = {
  anomalyStatistics: ["anomaly-statistics"] as const,
};

export function useArchive() {
  const getAnomalyStatistics = useQuery({
    queryKey: QUERY_KEYS.anomalyStatistics,
    queryFn: archiveApi.getAnomalyStatistics,
  });

  return {
    getAnomalyStatistics,
  };
}
