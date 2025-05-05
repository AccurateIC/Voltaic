// src/features/shared/api/anomaly.ts

import { AnomalyNotification } from "../../shared/types/anomaly.types.ts";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;

export const anomalyNotificationsApi = {
  getAll: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(`${BASE_URL}/notification/getAll`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all notifications", { cause: response.json() });
    return response.json() as Promise<AnomalyNotification[]>;
  },

  getResolved: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(`${BASE_URL}/notification/getResolved`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch resolved notifications", { cause: response.json() });
    return response.json() as Promise<AnomalyNotification[]>;
  },

  getUnresolved: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(`${BASE_URL}/notification/getUnresolved`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch unresolved notifications", { cause: response.json() });
    return response.json() as Promise<AnomalyNotification[]>;
  },

  read: async (notificationId: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/notification/read/${notificationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all notifications", { cause: response.json() });
    return response.json() as Promise<void>;
  },
};
