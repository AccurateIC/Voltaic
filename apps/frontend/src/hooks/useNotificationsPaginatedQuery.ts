import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { tuyau } from "../lib/Tuyau";
import { useMessageBus } from "../lib/MessageBus";
import { TransmitChannels } from "../lib/TransmitChannels";

const LIMIT = 50;

/** Canonical key for notification list — Alarms + AnomalyNotificationTable share cache for page 1. */
export const notificationsPaginatedQueryKey = (page: number) =>
  ["notifications", "paginated", { page, limit: LIMIT, includeResolved: true }] as const;

const SAFETY_POLL_MS = 15_000;

/**
 * Paginated notifications with realtime refresh (message bus) + periodic poll
 * so data stays current if an event is missed.
 */
export function useNotificationsPaginatedQuery(page: number) {
  const query = useQuery({
    queryKey: notificationsPaginatedQueryKey(page),
    queryFn: async () => {
      const { data, error } = await tuyau.notification.getAll.$get({
        query: { page, limit: LIMIT, includeResolved: true },
      });
      if (error) {
        throw new Error(error.message || "Failed to fetch notifications");
      }
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchInterval: SAFETY_POLL_MS,
    refetchIntervalInBackground: false,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMessageBus(TransmitChannels.NOTIFICATION, () => {
    if (debounceRef.current) {
      return;
    }
    debounceRef.current = setTimeout(() => {
      void query.refetch();
      debounceRef.current = null;
    }, 300);
  });

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return query;
}
