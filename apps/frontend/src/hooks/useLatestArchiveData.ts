import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMessageBus } from "../lib/MessageBus";
import { tuyau } from "../lib/Tuyau";
import type { Archive } from "../types/archive.types";

export const useLatestArchiveData = () => {
  const query = useQuery({
    queryKey: ["archive", "latest"],
    queryFn: async (): Promise<Archive[]> => {
      const { data, error } = await tuyau.archive.getLatest.$get();
      if (error) {
        throw new Error("Unable to load data. Please try again later.");
      }
      return (data ?? []) as Archive[];
    },
    staleTime: 5_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  useMessageBus("archive", () => {
    query.refetch();
  });

  const latestData = useMemo(() => query.data ?? [], [query.data]);
  const errorMessage = query.isError ? "Unable to load data. Please try again later." : null;

  return {
    latestData,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage,
    refetch: query.refetch,
  };
};

export default useLatestArchiveData;
