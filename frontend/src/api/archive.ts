// frontend/src/api/archive.ts
import { AnomalyStatistics, Archive, GensetPropertyStatistics, GetPropertyStatisticsFilters } from "../types/archive.types";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;
export interface GetPropertyDataBetween {
  from: string;
  to: string;
  properties: string[];
}
export const archiveApi = {
  getPropertyStatistics: async (filters: GetPropertyStatisticsFilters): Promise<GensetPropertyStatistics> => {
    const response = await fetch(
      `${BASE_URL}/archive/getPropertyStatistics?propertyName=${filters.propertyName}&timeDuration=${filters.timeDuration}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error(`Failed to get property statistics for ${filters.propertyName}`);
    return response.json() as Promise<GensetPropertyStatistics>;
  },

  getAnomalyStatistics: async (): Promise<AnomalyStatistics> => {
    const response = await fetch(`${BASE_URL}/archive/getAnomalyStatistics`, {
      method: "GET",
      headers: { "Content-Type": "application/json", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get anomaly statistics");
    return response.json() as Promise<AnomalyStatistics>;
  },

  getPropertyDataBetween: async (filters: GetPropertyDataBetween): Promise<Archive[]> => {
    const response = await fetch(`${BASE_URL}/archive/getPropertyDataBetween`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", timezone: "Asia/Kolkata" },
      body: JSON.stringify(filters),
    });

    if (!response.ok) throw new Error("Failed to fetch archive data for given properties", { cause: response.json() });
    return response.json() as Promise<Archive>;
  },
};
