import { ROUTES } from "../config/backend";
import { PDMCreationResponse, PDMNotification, PDMStatistics, VibrationData } from "../types/pdm.types";

export const pdmApi = {
  create: async (): Promise<PDMCreationResponse> => {
    const response = await fetch(ROUTES.PDM_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to create PDM records", { cause: response.json() });
    return response.json() as Promise<PDMCreationResponse>;
  },

  getRecentVibrationData: async (): Promise<VibrationData[]> => {
    const response = await fetch(ROUTES.PDM_NOTIF_GET_RECENT, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getLatestVibrationEntry: async (): Promise<VibrationData[]> => {
    const response = await fetch(ROUTES.PDM_NOTIF_GET_LATEST_ENTRY, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getRecentActualVibrationData: async (): Promise<VibrationData[]> => {
    const response = await fetch(ROUTES.PDM_NOTIF_GET_RECENT_ACTUAL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getRecentForecastedVibrationData: async (): Promise<VibrationData[]> => {
    const response = await fetch(ROUTES.PDM_NOTIF_GET_RECENT_FORECASTED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getAllNotifications: async (): Promise<PDMNotification[]> => {
    const response = await fetch(ROUTES.PDM_NOTIF_GET_ALL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<PDMNotification[]>;
  },

  getUnresolvedNotifications: async (): Promise<PDMNotification[]> => {
    const response = await fetch(ROUTES.PDM_NOTIF_GET_UNRESOLVED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<PDMNotification[]>;
  },

  getLatestUnresolvedNotification: async (): Promise<PDMNotification> => {
    const response = await fetch(ROUTES.PDM_NOTIF_GET_LATEST_UNRESOLVED, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch latest unresolved PDM notification", { cause: response.json() });
    return response.json() as Promise<PDMNotification>;
  },

  markNotificationAsRead: async (notificationId: number): Promise<PDMNotification> => {
    const response = await fetch(`${ROUTES.PDM_NOTIF_MARK_AS_READ}/${notificationId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok)
      throw new Error(`Failed to mark notification as read. Notification ID: ${notificationId}`, { cause: response.json() });

    return response.json() as Promise<PDMNotification>;
  },

  // TODO: get timezone from user's browser instead of hardcoding
  getPDMStatistics: async (timeDuration: string): Promise<PDMStatistics> => {
    const response = await fetch(ROUTES.PDM_GET_STATISTICS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        timezone: "Asia/Kolkata",
      },
      credentials: "include",
      body: JSON.stringify({ timeDuration: timeDuration }),
    });

    if (!response.ok) {
      console.log(await response.json());
      throw new Error(`Failed to fetch PDM statistics`);
    }

    return response.json() as Promise<PDMStatistics>;
  },

  deleteAllPdmData: async (): Promise<VibrationData> => {
    const response = await fetch(ROUTES.PDM_DELETE, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Failed to delete pdm data`, { cause: await response.json() });
    return response.json() as Promise<VibrationData>;
  },
};
