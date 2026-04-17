import Archive from "#models/archive";
import { DateTime, DateTimeUnit, DayNumbers, MonthNumbers, WeekNumbers } from "luxon";
import { type UUID } from "node:crypto";
import logger from "@adonisjs/core/services/logger";
export interface PropertyStatisticsData {
  day?: DayNumbers;
  week?: WeekNumbers;
  month: MonthNumbers;
  year: number;
  genset_property_id: UUID;
  avg: number;
}

export interface PropertyStatisticsMetadata {
  timeDuration: "year" | "month" | "week";
  averaged: string;
}

export interface PropertyStatisticsResponse {
  meta: PropertyStatisticsMetadata;
  data: PropertyStatisticsData[];
}

export class ArchiveService {
  static async getLatestEntries() {
    return Archive.query()
      .where((builder) => builder.where("timestamp", "=", Archive.query().max("timestamp")))
      .preload("gensetProperty", (query) => {
        query.preload("physicalQuantity");
      });
  }

  static async getPropertyStatisticsForWeek(
    timezone: string,
    propertyName: string
  ): Promise<PropertyStatisticsResponse> {
    const now = DateTime.now().setZone(timezone).toUTC();
    const startOfWeek = now.startOf("week").toJSDate();
    const endOfWeek = now.endOf("week").toJSDate();

    const statistics = (await Archive.query() //
      .select("day", "month", "year", "genset_property_id")
      .whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.where("propertyName", propertyName);
      })
      .whereBetween("timestamp", [startOfWeek, endOfWeek])
      .avg("property_value")
      .groupBy("day", "month", "year", "genset_property_id")
      .orderBy("genset_property_id", "asc")
      .pojo()) as PropertyStatisticsData[];

    return { meta: { timeDuration: "week", averaged: "daily" }, data: statistics };
  }

  static async getPropertyStatisticsForMonth(
    timezone: string,
    propertyName: string
  ): Promise<PropertyStatisticsResponse> {
    const now = DateTime.now().setZone(timezone).toUTC();
    const startOfMonth = now.startOf("month").toJSDate();
    const endOfMonth = now.endOf("month").toJSDate();

    const statistics = await Archive.query() //
      .select("week", "month", "year", "genset_property_id")
      .whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.where("propertyName", propertyName);
      })
      .whereBetween("timestamp", [startOfMonth, endOfMonth])
      .avg("property_value")
      .groupBy("week", "month", "year", "genset_property_id")
      .orderBy("genset_property_id", "asc")
      .pojo();

    return { meta: { timeDuration: "month", averaged: "weekly" }, data: statistics as PropertyStatisticsData[] };
  }

  static async getPropertyStatisticsForYear(
    timezone: string,
    propertyName: string
  ): Promise<PropertyStatisticsResponse> {
    const now = DateTime.now().setZone(timezone).toUTC();
    const startOfYear = now.startOf("year").toJSDate();
    const endOfYear = now.endOf("year").toJSDate();

    const statistics = await Archive.query() //
      .select("month", "year", "genset_property_id")
      .whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.where("propertyName", propertyName);
      })
      .whereBetween("timestamp", [startOfYear, endOfYear])
      .avg("property_value")
      .groupBy("month", "year", "genset_property_id")
      .orderBy("genset_property_id", "asc")
      .pojo();

    return { meta: { timeDuration: "year", averaged: "monthly" }, data: statistics as PropertyStatisticsData[] };
  }

  static async getAnomalyCount(timezone?: string, timeDuration?: DateTimeUnit, properties?: string[]): Promise<number> {
   logger.info({ timezone }, "getAnomalyCount timezone");
    const query = Archive.query() //
      .where("isAnomaly", true);

    if (timeDuration) {
      const now = DateTime.now().setZone(timezone); // user's timezone
      const startOfDuration: Date = now.startOf(timeDuration).toUTC().toJSDate();
      const endOfDuration: Date = now.endOf(timeDuration).toUTC().toJSDate();
      query.whereBetween("timestamp", [startOfDuration, endOfDuration]);
    }

    if (properties) {
      query //
        .whereHas(
          "gensetProperty", //
          (builder) => builder.whereIn("propertyName", properties)
        );
    }
    const res = await query.count("*");
    const count: string = res[0].$extras.count;
    return Number.parseInt(count);
  }
  // ============================================================================
  // 🚀 TASK 4.1: NEW OPTIMIZED METHOD
  // ============================================================================
  static async getAllAnomalyStatistics(timezone: string) {
    const now = DateTime.now().setZone(timezone);
    const startOfDay = now.startOf("day").toUTC().toJSDate();
    const startOfWeek = now.startOf("week").toUTC().toJSDate();
    const startOfMonth = now.startOf("month").toUTC().toJSDate();
    const startOfYear = now.startOf("year").toUTC().toJSDate();

    // Single query — fetch all anomaly archives with their property info
    const anomalies = await Archive.query()
      .where("isAnomaly", true)
      .preload("gensetProperty")
      .orderBy("timestamp", "desc");

    // Build counts in-memory (one loop instead of 30+ queries)
    const byProperty = new Map<string, {
      propertyName: string;
      readablePropertyName: string;
      gensetPropertyId: string;
      today: number; 
      week: number; 
      month: number; 
      year: number; 
      total: number;
    }>();

    const overall = { today: 0, week: 0, month: 0, year: 0, total: 0 };

    for (const entry of anomalies) {
      const ts = entry.timestamp.toJSDate ? entry.timestamp.toJSDate() : entry.timestamp;
      const propName = entry.gensetProperty.propertyName;

      if (!byProperty.has(propName)) {
        byProperty.set(propName, {
          propertyName: propName,
          readablePropertyName: entry.gensetProperty.readablePropertyName,
          gensetPropertyId: entry.gensetPropertyId,
          today: 0, week: 0, month: 0, year: 0, total: 0,
        });
      }

      const prop = byProperty.get(propName)!;
      prop.total++;
      overall.total++;

      if (ts >= startOfYear) { prop.year++; overall.year++; }
      if (ts >= startOfMonth) { prop.month++; overall.month++; }
      if (ts >= startOfWeek) { prop.week++; overall.week++; }
      if (ts >= startOfDay) { prop.today++; overall.today++; }
    }

    return { overall, byProperty: Array.from(byProperty.values()) };
  }
}

