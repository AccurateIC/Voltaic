import { useQuery } from "@tanstack/react-query";
import { gensetPropertyApi } from "../api/gensetProperty";

export const QUERY_KEYS = {
  gensetProperty: ["genset-properties"] as const,
} as const;

export function useGensetProperty() {
  const getAllGensetProperties = useQuery({
    queryKey: QUERY_KEYS.gensetProperty,
    queryFn: gensetPropertyApi.getAllProperties,
  });

  return {
    getAllGensetProperties,
  };
}
