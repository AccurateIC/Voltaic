import { clsx } from "clsx";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: string[]) => twMerge(clsx(inputs));

export const formatTimestamp = (timestamp: string | Date) => {
  if (!timestamp) return;
  const dt = typeof timestamp === "string" ? DateTime.fromISO(timestamp) : DateTime.fromJSDate(timestamp);
  return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
