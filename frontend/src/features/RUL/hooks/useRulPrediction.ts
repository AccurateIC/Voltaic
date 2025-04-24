// src/features/RUL/hooks/useRulPrediction.ts

import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rulApi } from "../api/rul";

// export const QUERY_KEYS = {
//   rulPrediction: ["rul-prediction"] as const,
// };

export function useRulPrediction() {
  const queryClient = useQueryClient();

  const getRulPrediction = useMutation({
    mutationFn: rulApi.getPrediction,
    onError: (error) => {
      toast.error(`Failed to fetch RUL prediction: ${error?.message}`);
    },
    onSuccess: (data) => {
      toast.success("RUL prediction fetched successfully");
    },
  });

  const sendLoggedInUser = useMutation({
    mutationFn: rulApi.sendLoggedInUser,
    onError: (error) => {},
    onSuccess: (data) => {},
  });

  return {
    getRulPrediction,
    sendLoggedInUser,
  };
}
