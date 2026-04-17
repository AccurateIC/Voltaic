// src/features/RUL/hooks/useRulPrediction.ts

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { rulApi } from "../api/rul";

export const QUERY_KEYS = { rulPrediction: ["rul-prediction"] as const };

export function useRulPrediction() {
  const getRulPrediction = useMutation({
    mutationKey: QUERY_KEYS.rulPrediction,
    mutationFn: rulApi.getPrediction,
    onError: (error) => {
      toast.error(`Failed to fetch RUL prediction: ${error?.message}`);
    },
  });

  const sendLoggedInUser = useMutation({ mutationFn: rulApi.sendLoggedInUser, onError: () => {}, onSuccess: () => {} });

  return { getRulPrediction, sendLoggedInUser };
}
