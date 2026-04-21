import { useQuery } from "@tanstack/react-query";
import type { RulInputData } from "../types/rul.types";

export const rulDataJsonQueryKey = ["rul-data"] as const;
export const filteredHealthIndexJsonQueryKey = ["filtered-health-index"] as const;

export type FilteredHealthIndexRow = {
  Time_Hours: number;
  Predicted_Health_Index: number;
};

export function useRulDataJsonQuery() {
  return useQuery<Record<string, RulInputData[]>>({
    queryKey: rulDataJsonQueryKey,
    queryFn: async () => {
      const res = await fetch("/data/rulData.json");
      if (!res.ok) {
        throw new Error("Failed to load RUL data");
      }
      return (await res.json()) as Record<string, RulInputData[]>;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useFilteredHealthIndexJsonQuery() {
  return useQuery<FilteredHealthIndexRow[]>({
    queryKey: filteredHealthIndexJsonQueryKey,
    queryFn: async () => {
      const res = await fetch("/data/filteredHealthIndexData.json");
      if (!res.ok) {
        throw new Error("Failed to load health index trend data");
      }
      return (await res.json()) as FilteredHealthIndexRow[];
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
