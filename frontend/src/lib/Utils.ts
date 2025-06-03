import { clsx } from "clsx";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: string[]) => twMerge(clsx(inputs));

export const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return;
  const dt = DateTime.fromISO(timestamp);
  return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
