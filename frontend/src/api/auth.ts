// src/features/shared/api/auth.ts

import { User } from "../types/auth.types";

const BASE_URL = import.meta.env.VITE_ADONIS_BACKEND;

export const auth = {
  getLoggedInUser: async (): Promise<User> => {
    const response = await fetch(`${BASE_URL}/auth/getLoggedInUser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Authorization failed", { cause: response.json() });
    return response.json() as Promise<User>;
  },

  login: async (email: string, password: string): Promise<User> => {
    const response: Response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Failed to log in", { cause: response.json() });
    return response.json() as Promise<User>;
  },

  register: async (user: User): Promise<User> => {
    const response: Response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        isActive: true,
      }),
    });
    if (!response.ok) throw new Error("Failed to register", { cause: response.json() });
    return response.json() as Promise<User>;
  },
};
