import { useQuery } from "@tanstack/react-query";
import { tuyau } from "../lib/Tuyau";

/** Shared across RUL, Reports, and any page that needs session user — single cache, consistent options. */
export const loggedInUserQueryKey = ["logged-in-user"] as const;

const STALE_MS = 5 * 60 * 1000;

/** Use with `queryClient.fetchQuery` in event handlers so imperative code reuses the same cache as `useLoggedInUserQuery`. */
export async function loggedInUserQueryFn() {
  return tuyau.auth.getLoggedInUser.$get().unwrap();
}

export function useLoggedInUserQuery() {
  return useQuery({
    queryKey: loggedInUserQueryKey,
    queryFn: loggedInUserQueryFn,
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
  });
}
