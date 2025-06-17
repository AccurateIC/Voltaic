// src/features/shared/api/auth.ts
import { ROUTES } from "../config/backend";
import { User } from "../types/auth.types";

export const auth = {
  getLoggedInUser: async (): Promise<User> => {
    const response = await fetch(ROUTES.AUTH_USER_GET_LOGGED_IN_USER, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Authorization failed", { cause: response.json() });
    return response.json() as Promise<User>;
  },

  login: async (email: string, password: string): Promise<User> => {
    const response: Response = await fetch(ROUTES.AUTH_USER_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Failed to log in", { cause: response.json() });
    return response.json() as Promise<User>;
  },

  register: async (user: User): Promise<User> => {
    const response: Response = await fetch(ROUTES.AUTH_USER_REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
