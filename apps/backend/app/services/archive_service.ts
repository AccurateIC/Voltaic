import Archive from "#models/archive";
import type { HttpContext } from "@adonisjs/core/http";
import { propertyStatsValidator } from "#validators/archive";
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
    const res = await query.count("*").pojo() as { count: string }[];
    return parseInt(res[0].count);
  }

  static async getAnomalyStatistics(timezone: string) {
    // Validate timezone
    const now = DateTime.now().setZone(timezone);
    if (!now.isValid) throw new Error("Invalid IANA timezone");

    // Get properties with anomaly
    const propertyStats = (
      await Archive.query()
        .where("isAnomaly", true)
        .preload("gensetProperty")
        .select("gensetPropertyId")
        .groupBy("gensetPropertyId")
    ).map((record) => ({
      gensetPropertyId: record.gensetPropertyId,
      propertyName: record.gensetProperty.propertyName,
      readablePropertyName: record.gensetProperty.readablePropertyName,
    }));

    const byProperty = await Promise.all(
      propertyStats.map(async (entry) => {
        const today = await this.getAnomalyCount(timezone, "day", [entry.propertyName]);
        const week = await this.getAnomalyCount(timezone, "week", [entry.propertyName]);
        const month = await this.getAnomalyCount(timezone, "month", [entry.propertyName]);
        const year = await this.getAnomalyCount(timezone, "year", [entry.propertyName]);
        const total = await this.getAnomalyCount(undefined, undefined, [entry.propertyName]);

        return { ...entry, today, week, month, year, total };
      })
    );

    const overall = {
      today: await this.getAnomalyCount(timezone, "day"),
      week: await this.getAnomalyCount(timezone, "week"),
      month: await this.getAnomalyCount(timezone, "month"),
      year: await this.getAnomalyCount(timezone, "year"),
      total: await this.getAnomalyCount(),
    };

    return { timezone, overall, byProperty };
  }

  static async getPropertyStatistics({ request }: HttpContext) {
    const data = await request.validateUsing(propertyStatsValidator);

    const timezone: string = data.headers.timezone;
    const timeDuration: DateTimeUnit = data.timeDuration;
    const now = DateTime.now().setZone(timezone).toUTC();
    const startOfDuration = now.startOf(timeDuration);
    const endOfDuration = now.endOf(timeDuration);

    let responseData;

    switch (timeDuration) {
      case "day": // show data averaged hourly
        // not implemented
        break;
      case "week": // show data averaged daily
        responseData = await Archive.query() //
          .select("day", "month", "year", "genset_property_id")
          // .whereHas("gensetProperty", (propertyQuery) => {
          //   propertyQuery.where("propertyName", data.propertyName);
          // })
          .whereHas("gensetProperty", (propertyQuery) => {
            if (data.properties?.length) {
              propertyQuery.whereIn("propertyName", data.properties);
            }
            //  else {
            //   propertyQuery.where("propertyName", data.propertyName);
            // }
          })
          .whereBetween("timestamp", [startOfDuration.toJSDate(), endOfDuration.toJSDate()])
          .avg("property_value")
          .groupBy("day", "month", "year", "genset_property_id")
          .orderBy("genset_property_id", "asc")
          .pojo();

        responseData = { meta: { timeDuration, averaged: "daily" }, data: responseData };

        break;
      case "month": // show data averaged weekly
        responseData = await Archive.query() //
          .select("week", "month", "year", "genset_property_id")
          // .whereHas("gensetProperty", (propertyQuery) => {
          //   propertyQuery.where("propertyName", data.propertyName);
          // })
          .whereHas("gensetProperty", (propertyQuery) => {
            if (data.properties?.length) {
              propertyQuery.whereIn("propertyName", data.properties);
            }
            // else {
            //   propertyQuery.where("propertyName", data.propertyName);
            // }
          })
          .whereBetween("timestamp", [startOfDuration.toJSDate(), endOfDuration.toJSDate()])
          .avg("property_value")
          .groupBy("week", "month", "year", "genset_property_id")
          .orderBy("genset_property_id", "asc")
          .pojo();

        responseData = { meta: { timeDuration, averaged: "daily" }, data: responseData };

        break;
      case "year": // show data averaged monthly
        responseData = await Archive.query() //
          .select("month", "year", "genset_property_id")
          // .whereHas("gensetProperty", (propertyQuery) => {
          //   propertyQuery.where("propertyName", data.propertyName);
          // })
          .whereHas("gensetProperty", (propertyQuery) => {
            if (data.properties?.length) {
              propertyQuery.whereIn("propertyName", data.properties);
            }
            // else {
            //   propertyQuery.where("propertyName", data.propertyName);
            // }
          })
          .whereBetween("timestamp", [startOfDuration.toJSDate(), endOfDuration.toJSDate()])
          .avg("property_value")
          .groupBy("month", "year", "genset_property_id")
          .orderBy("genset_property_id", "asc")
          .pojo();

        responseData = { meta: { timeDuration, averaged: "daily" }, data: responseData };

        break;
      default:
        break;
    }

    return responseData;
  }

  // static async getAnomalyStatistics(timezone: string) {
  //   // Validate timezone
  //   const now = DateTime.now().setZone(timezone);
  //   if (!now.isValid) throw new Error("Invalid IANA timezone");

  //   // Get properties with anomaly
  //   const propertyStats = (
  //     await Archive.query()
  //       .where("isAnomaly", true)
  //       .preload("gensetProperty")
  //       .select("gensetPropertyId")
  //       .groupBy("gensetPropertyId")
  //   ).map((record) => ({
  //     gensetPropertyId: record.gensetPropertyId,
  //     propertyName: record.gensetProperty.propertyName,
  //     readablePropertyName: record.gensetProperty.readablePropertyName,
  //   }));

  //   const byProperty = await Promise.all(
  //     propertyStats.map(async (entry) => {
  //       const today = await this.getAnomalyCount(timezone, "day", [entry.propertyName]);
  //       const week = await this.getAnomalyCount(timezone, "week", [entry.propertyName]);
  //       const month = await this.getAnomalyCount(timezone, "month", [entry.propertyName]);
  //       const year = await this.getAnomalyCount(timezone, "year", [entry.propertyName]);
  //       const total = await this.getAnomalyCount(undefined, undefined, [entry.propertyName]);

  //       return { ...entry, today, week, month, year, total };
  //     })
  //   );

  //   const overall = {
  //     today: await this.getAnomalyCount(timezone, "day"),
  //     week: await this.getAnomalyCount(timezone, "week"),
  //     month: await this.getAnomalyCount(timezone, "month"),
  //     year: await this.getAnomalyCount(timezone, "year"),
  //     total: await this.getAnomalyCount(),
  //   };

  //   return { timezone, overall, byProperty };
  // }

  // static async getPropertyStatistics({ request }: HttpContext) {
  //   const data = await request.validateUsing(propertyStatsValidator);

  //   const timezone: string = data.headers.timezone;
  //   const timeDuration: DateTimeUnit = data.timeDuration;
  //   const now = DateTime.now().setZone(timezone).toUTC();
  //   const startOfDuration = now.startOf(timeDuration);
  //   const endOfDuration = now.endOf(timeDuration);

  //   let responseData;

  //   switch (timeDuration) {
  //     case "day": // show data averaged hourly
  //       // not implemented
  //       break;
  //     case "week": // show data averaged daily
  //       responseData = await Archive.query() //
  //         .select("day", "month", "year", "genset_property_id")
  //         // .whereHas("gensetProperty", (propertyQuery) => {
  //         //   propertyQuery.where("propertyName", data.propertyName);
  //         // })
  //         .whereHas("gensetProperty", (propertyQuery) => {
  //           if (data.properties?.length) {
  //             propertyQuery.whereIn("propertyName", data.properties);
  //           }
  //           //  else {
  //           //   propertyQuery.where("propertyName", data.propertyName);
  //           // }
  //         })
  //         .whereBetween("timestamp", [startOfDuration, endOfDuration])
  //         .avg("property_value")
  //         .groupBy("day", "month", "year", "genset_property_id")
  //         .orderBy("genset_property_id", "asc")
  //         .pojo();

  //       responseData = { meta: { timeDuration, averaged: "daily" }, data: responseData };

  //       break;
  //     case "month": // show data averaged weekly
  //       responseData = await Archive.query() //
  //         .select("week", "month", "year", "genset_property_id")
  //         // .whereHas("gensetProperty", (propertyQuery) => {
  //         //   propertyQuery.where("propertyName", data.propertyName);
  //         // })
  //         .whereHas("gensetProperty", (propertyQuery) => {
  //           if (data.properties?.length) {
  //             propertyQuery.whereIn("propertyName", data.properties);
  //           }
  //           // else {
  //           //   propertyQuery.where("propertyName", data.propertyName);
  //           // }
  //         })
  //         .whereBetween("timestamp", [startOfDuration, endOfDuration])
  //         .avg("property_value")
  //         .groupBy("week", "month", "year", "genset_property_id")
  //         .orderBy("genset_property_id", "asc")
  //         .pojo();

  //       responseData = { meta: { timeDuration, averaged: "daily" }, data: responseData };

  //       break;
  //     case "year": // show data averaged monthly
  //       responseData = await Archive.query() //
  //         .select("month", "year", "genset_property_id")
  //         // .whereHas("gensetProperty", (propertyQuery) => {
  //         //   propertyQuery.where("propertyName", data.propertyName);
  //         // })
  //         .whereHas("gensetProperty", (propertyQuery) => {
  //           if (data.properties?.length) {
  //             propertyQuery.whereIn("propertyName", data.properties);
  //           }
  //           // else {
  //           //   propertyQuery.where("propertyName", data.propertyName);
  //           // }
  //         })
  //         .whereBetween("timestamp", [startOfDuration, endOfDuration])
  //         .avg("property_value")
  //         .groupBy("month", "year", "genset_property_id")
  //         .orderBy("genset_property_id", "asc")
  //         .pojo();

  //       responseData = { meta: { timeDuration, averaged: "daily" }, data: responseData };

  //       break;
  //     default:
  //       break;
  //   }

  //   return responseData;
  // }
}
