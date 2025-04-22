import { AnomalyNotification } from "../types/anomaly.types";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;

export const anomalyNotificationsApi = {
  getResolved: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(`${BASE_URL}/notification/getResolved`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch resolved anomalies");
    return response.json() as Promise<AnomalyNotification[]>;
  },

  getUnresolved: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(`${BASE_URL}/notification/getUnresolved`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch unresolved anomalies");
    return response.json() as Promise<AnomalyNotification[]>;
  },

  resolve: async (notificationId: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/notification/read/${notificationId}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to mark anomaly as read");
    return response.json() as Promise<void>;
  },
};
