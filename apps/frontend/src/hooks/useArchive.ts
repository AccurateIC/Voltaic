// frontend/src/hooks/anomalies/useAnomalyNotification.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { archiveApi, GetDataPaginatedFilters } from "../api/archive";
import { GetPropertyStatisticsFilters } from "../types/archive.types";

export const QUERY_KEYS = {
  anomalyStatistics: ["anomaly-statistics"] as const,
  propertyStatistics: (filters: GetPropertyStatisticsFilters) => [
    "property-statistics",
    filters.propertyName,
    filters.timeDuration,
  ],
  propertyDataBetween: ["property-data-between"] as const,
  paginated: (filters: GetDataPaginatedFilters) => [
    "paginated",
    filters.from,
    filters.to,
    filters.page,
    filters.isAnomaly,
    filters.propertyNames,
  ],
};

export function useArchive() {
  const getDataPaginated = useMutation({
    mutationFn: (filters: GetDataPaginatedFilters) => archiveApi.getDataPaginated(filters),
  });

  // const getDataPaginated = (filters: GetDataPaginatedFilters) => useMutation({
  //     mutationFn: () => archiveApi.getDataPaginated(filters),
  //     mutationKey: QUERY_KEYS.paginated(filters),
  //   });

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
  });

  return {
    getDataPaginated,
    getPropertyStatistics,
    getAnomalyStatistics,
    getPropertyDataBetween,
  };
}
