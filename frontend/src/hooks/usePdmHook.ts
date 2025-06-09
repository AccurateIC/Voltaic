import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pdmApi } from "../api/pdm";

export function usePDM() {
  const queryClient = useQueryClient();

  const getPDMStatistics = useMutation({
    mutationFn: pdmApi.getPDMStatistics,
    onSuccess: () => {},
    onError: () => {},
  });

  return {
    getPDMStatistics,
  };
}
