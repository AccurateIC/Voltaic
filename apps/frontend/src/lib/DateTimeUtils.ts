import { DateTime, MonthNumbers, WeekNumbers } from "luxon";

interface TimeRange {
  start: DateTime;
  end: DateTime;
}

/**
 * Gets the date range for a specific week that falls within the given month and year.
 * If the week spans across months, the range is clipped to the specified month's boundaries.
 * Uses Monday as the start of the week (ISO week).
 *
 * @param {WeekNumbers} weekNumber - The ISO week number (1-53)
 * @param {MonthNumbers} month - The month number (1-12)
 * @param {number} year - The year
 * @returns {TimeRange} An object containing the start and end DateTime objects for the week range
 *
 * @example
 * // Get the range for week 22 in June 2025
 * const range = getWeekRange(22, 6, 2025);
 * console.log(range.start.toISODate()); // '2025-05-26'
 * console.log(range.end.toISODate());   // '2025-06-01'
 *
 * @example
 * // Get the range for week 23 in June 2025
 * const range = getWeekRange(23, 6, 2025);
 * console.log(range.start.toISODate()); // '2025-06-02'
 * console.log(range.end.toISODate());   // '2025-06-08'
 *
 * @throws Will throw an error if invalid week number (>53) or month number (>12) is provided
 */
export const getWeekRange = (weekNumber: WeekNumbers, month: MonthNumbers, year: number): TimeRange => {
  const firstDayOfWeek = DateTime.fromObject({ weekYear: year, weekNumber: weekNumber }).startOf("week");
  const lastDayOfWeek: DateTime = firstDayOfWeek.endOf("week");

  const monthStart: DateTime = DateTime.fromObject({ year, month }).startOf("month");
  const monthEnd: DateTime = monthStart.endOf("month");

  return { start: DateTime.max(firstDayOfWeek, monthStart), end: DateTime.min(lastDayOfWeek, monthEnd) };
};
