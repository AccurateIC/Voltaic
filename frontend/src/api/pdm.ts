import { ROUTES } from "../config/backend";
import {
  PDMCreationResponse,
  PDMNotification,
  PDMNotificationCount,
  PDMStatistics,
  VibrationData,
} from "../types/pdm.types";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;

export const pdmApi = {
  create: async (): Promise<PDMCreationResponse> => {
    const response = await fetch(`${BASE_URL}/pdm/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to create PDM records", { cause: response.json() });
    return response.json() as Promise<PDMCreationResponse>;
  },

  getRecentVibrationData: async (): Promise<VibrationData[]> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/getRecent`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getLatestVibrationEntry: async (): Promise<VibrationData[]> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/getLatestEntry`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getRecentActualVibrationData: async (): Promise<VibrationData[]> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/getRecentActual`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getRecentForecastedVibrationData: async (): Promise<VibrationData[]> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/getRecentForecasted`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<VibrationData[]>;
  },

  getAllNotifications: async (): Promise<PDMNotification[]> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/getAll`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<PDMNotification[]>;
  },

  getUnresolvedNotifications: async (): Promise<PDMNotification[]> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/getUnresolved`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch all PDM Notifications", { cause: response.json() });
    return response.json() as Promise<PDMNotification[]>;
  },

  getLatestUnresolvedNotification: async (): Promise<PDMNotification> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/getLatestUnresolved`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch latest unresolved PDM notification", { cause: response.json() });
    return response.json() as Promise<PDMNotification>;
  },

  markNotificationAsRead: async (notificationId: number): Promise<PDMNotification> => {
    const response = await fetch(`${BASE_URL}/pdm/notification/read/${notificationId}`, {
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
    const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/notification/getStatistics`, {
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
    const response = await fetch(`${BASE_URL}/pdm/delete`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Failed to delete pdm data`, { cause: await response.json() });
    return response.json() as Promise<VibrationData>;
  },
};

// 1384
