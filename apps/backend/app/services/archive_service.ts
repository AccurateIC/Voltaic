import Archive from "#models/archive";
import { DateTime, DateTimeUnit, DayNumbers, MonthNumbers, WeekNumbers } from "luxon";
import { type UUID } from "node:crypto";

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
    console.log(timezone);
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
    return parseInt(count);
  }
}
