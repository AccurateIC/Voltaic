// src/features/RUL/api/rul.ts

import { Modules } from "../config/extern";
import { User } from "../types/auth.types";
import { RulInputData, RulResponse } from "../types/rul.types";

const BASE_URL = Modules.RUL;

export const rulApi = {
  getPrediction: async (inputData: RulInputData): Promise<RulResponse> => {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: "POST",
      body: JSON.stringify(inputData),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errData = await response.json();
      console.error("RUL", errData);
      throw new Error("Failed to fetch RUL prediction");
    }
    const rulData = await response.json();
    console.log("RUL", rulData);
    return rulData as Promise<RulResponse>;
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
