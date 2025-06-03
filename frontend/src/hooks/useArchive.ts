// frontend/src/hooks/anomalies/useAnomalyNotification.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { archiveApi } from "../api/archive";
import { GetPropertyStatisticsFilters } from "../types/archive.types";

export const QUERY_KEYS = {
  anomalyStatistics: ["anomaly-statistics"] as const,
  propertyStatistics: (filters: GetPropertyStatisticsFilters) => [
    "property-statistics",
    filters.propertyName,
    filters.timeDuration,
  ],
  propertyDataBetween: ["property-data-between"] as const,
};

export function useArchive() {
  const getPropertyStatistics = (filters: GetPropertyStatisticsFilters) =>
    useQuery({
      queryKey: QUERY_KEYS.propertyStatistics(filters),
      queryFn: () => archiveApi.getPropertyStatistics(filters),
    });

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
    getPropertyStatistics,
    getAnomalyStatistics,
    getPropertyDataBetween,
  };
}
