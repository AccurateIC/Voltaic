// frontend/src/hooks/anomalies/useAnomalyNotification.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { archiveApi } from "../api/archive";

export const QUERY_KEYS = {
  anomalyStatistics: ["anomaly-statistics"] as const,
  propertyDataBetween: ["property-data-between"] as const,
  testAvg: ["proprty_value-average"] as const,
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

  const testAgg= useMutation({
     mutationFn: archiveApi.testAgg,
     mutationKey: QUERY_KEYS.testAvg,
       onSuccess: (data) => {},

  })
  
  return {
    getAnomalyStatistics,
    getPropertyDataBetween,
    testAgg,
  };
}
