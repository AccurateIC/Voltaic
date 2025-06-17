// src/features/shared/api/auth.ts
import { ROUTES } from "../config/backend";
import { GensetProperty } from "../types/gensetProperty.types";

export const gensetPropertyApi = {
  getAllProperties: async (): Promise<GensetProperty> => {
    const response = await fetch(ROUTES.GENSET_PROPERTY_GET_ALL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch genset properties", { cause: response.json() });
    return response.json() as Promise<GensetProperty>;
  },
};
