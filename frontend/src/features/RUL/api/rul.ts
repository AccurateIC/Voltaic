// src/features/RUL/api/rul.ts

import { User } from "../../shared/types/auth.types";
import { RulInputData, RulPrediction } from "../types/rul.types";

const BASE_URL = import.meta.env.VITE_RUL_BACKEND;

export const rulApi = {
  getPrediction: async (inputData: RulInputData): Promise<RulPrediction> => {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      body: JSON.stringify(inputData),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch RUL prediction");
    return response.json() as Promise<RulPrediction>;
  },

  sendLoggedInUser: async (user: User): Promise<void> => {
    const response = await fetch(`${BASE_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, logged_in: true }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to send user details to RUL server");
    return response.json() as Promise<void>;
  },
};
