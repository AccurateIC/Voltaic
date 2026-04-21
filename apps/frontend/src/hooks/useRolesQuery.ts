import { useQuery } from "@tanstack/react-query";
import { tuyau } from "../lib/Tuyau";

export const rolesQueryKey = ["roles", "all"] as const;

export async function rolesQueryFn() {
  return tuyau.role.getAll.$get().unwrap();
}

export function useRolesQuery() {
  return useQuery({
    queryKey: rolesQueryKey,
    queryFn: rolesQueryFn,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
