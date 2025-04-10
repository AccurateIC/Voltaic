import { clsx } from "clsx";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return;
  const dt = DateTime.fromISO(timestamp);
  return dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
};
