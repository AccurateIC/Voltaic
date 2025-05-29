// frontend/src/api/archive.ts
import { AnomalyStatistics, Archive, AvgStatisstics } from "../types/archive.types";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;
export interface GetPropertyDataBetween {
  from: string;
  to: string;
  properties: string[];
}

export interface GetTestAgg {
  property: string;
  timeDuration: string;
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

  testAgg: async (filters: GetTestAgg): Promise<AvgStatisstics[]> => {
    // Build query string from filters object
    const queryParams = new URLSearchParams({
      property: filters.property,
      timeDuration: filters.timeDuration,
    }).toString();

    const response = await fetch(`${BASE_URL}/archive/testAgg?${queryParams}`, {
      method: "GET", // change method to GET for query params
      credentials: "include",
      headers: { "Content-Type": "application/json", timezone: "Asia/Kolkata" },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error("Failed to fetch archive data for given properties", { cause: errorBody });
    }

    return response.json() as Promise<AvgStatisstics[]>;
  },
};
