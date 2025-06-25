import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../api/auth";
import { User } from "../types/auth.types";
import { toast } from "sonner";


export const AUTH_QUERY_KEYS = {
  auth: ["auth"] as const,
  user: ["user"] as const,
} as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const getLoggedInUser = useQuery({
    queryKey: AUTH_QUERY_KEYS.auth,
    queryFn: auth.getLoggedInUser,
  });

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => auth.login(email, password),
    onSuccess: (user: User) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.auth });
      toast.success("Successfully logged in!");
    },
    onError: (error: Error) => {
      toast.error(`Login failed: ${error.message}`);
    },
  });

  const register = useMutation({
    mutationFn: (userData: User) => auth.register(userData),
    onSuccess: (user: User) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.auth });
      toast.success("Successfully registered!");
    },
    onError: (error: Error) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });

  return {
    login,
    register,
    getLoggedInUser,
  };
}
