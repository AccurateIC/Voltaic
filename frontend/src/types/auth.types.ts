// src/features/shared/types/auth.types.ts

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  isActive: boolean;
  password?: string; // optional for login and registration
  logged_in?: boolean; // optional for sending user details
}
