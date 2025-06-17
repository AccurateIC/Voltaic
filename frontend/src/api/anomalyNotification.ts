// src/features/shared/api/anomaly.ts

import { ROUTES } from "../config/backend.js";
import { AnomalyNotification } from "../types/anomaly.types";

export const anomalyNotificationsApi = {
  getAll: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(ROUTES.ANOMALY_NOTIF_GET_ALL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all notifications", { cause: response.json() });
    return response.json() as Promise<AnomalyNotification[]>;
  },

  getResolved: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(ROUTES.ANOMALY_NOTIF_GET_RESOLVED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch resolved notifications", { cause: response.json() });
    return response.json() as Promise<AnomalyNotification[]>;
  },

  getUnresolved: async (): Promise<AnomalyNotification[]> => {
    const response = await fetch(ROUTES.ANOMALY_NOTIF_GET_UNRESOLVED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch unresolved notifications", { cause: response.json() });
    return response.json() as Promise<AnomalyNotification[]>;
  },

  read: async (notificationId: number): Promise<void> => {
    const response = await fetch(ROUTES.ANOMALY_NOTIF_MARK_AS_READ + "/" + notificationId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all notifications", { cause: response.json() });
    return response.json() as Promise<void>;
  },
};
