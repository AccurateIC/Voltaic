// src/features/shared/api/auth.ts
import { GensetProperty } from "../types/gensetProperty.types";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;

export const gensetPropertyApi = {
  getAllProperties: async (): Promise<GensetProperty> => {
    const response = await fetch(`${BASE_URL}/property/getAll`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch genset properties", { cause: response.json() });
    return response.json() as Promise<GensetProperty>;
  },
};
