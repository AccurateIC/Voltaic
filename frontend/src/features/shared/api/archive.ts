import { AnomalyStatistics, Archive } from "../types/archive.types";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;
export interface GetPropertyDataBetween {
  from: string;
  to: string;
  properties: string[];
}
export const archiveApi = {
  getAnomalyStatistics: async (): Promise<AnomalyStatistics> => {
    const response = await fetch(`${BASE_URL}/archive/getAnomalyStatistics`, {
      method: "GET",
      headers: { "Content-Type": "application/json", timezone: "Asia/Kolkata" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get anomaly statistics");
    return response.json() as Promise<AnomalyStatistics>;
  },

  getPropertyDataBetween: async (filters: GetPropertyDataBetween): Promise<Archive> => {
    const response = await fetch(`${BASE_URL}/property/getBetween`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(filters),
    });

    if (!response.ok) throw new Error("Failed to fetch archive data for given properties", { cause: response.json() });
    return response.json() as Promise<Archive>;
  },
};
