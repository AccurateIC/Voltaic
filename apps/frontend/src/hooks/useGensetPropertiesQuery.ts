import { useQuery } from "@tanstack/react-query";
import { tuyau } from "../lib/Tuyau";

/** Shared by Archive, Alarms, Anomalies — one cache entry when navigating between pages. */
export const gensetPropertiesQueryKey = ["genset-properties"] as const;

const STALE_MS = 5 * 60 * 1000;

export function useGensetPropertiesQuery() {
  return useQuery({
    queryKey: gensetPropertiesQueryKey,
    queryFn: () => tuyau.property.getAll.$get().unwrap(),
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
  });
}
