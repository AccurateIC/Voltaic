import { useQuery } from "@tanstack/react-query";
import { tuyau } from "../lib/Tuyau";
import { anomalyStatisticsQueryKey } from "./archiveQueryKeys";

const POLL_MS = 5000;

/**
 * Single shared query for `getAnomalyStatistics` — Reports charts + Anomalies page
 * share one cache entry; polling keeps data current when any screen is mounted.
 */
export function useAnomalyStatisticsQuery() {
  return useQuery({
    queryKey: anomalyStatisticsQueryKey,
    queryFn: () => tuyau.archive.getAnomalyStatistics.$get().unwrap(),
    staleTime: 0,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  });
}
