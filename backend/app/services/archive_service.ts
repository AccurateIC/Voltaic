import Archive from "#models/archive";
import { DateTime, DateTimeUnit } from "luxon";
import {
  getAnomalyStatisticsValidator,
} from "#validators/archive";

export class ArchiveService {
  static async getLatestEntries() {
    return Archive.query()
      .where((builder) => builder.where("timestamp", "=", Archive.query().max("timestamp")))
      .preload("gensetProperty", (query) => {
        query.preload("physicalQuantity");
      });

  }
  static async getAnomalyCount(timezone?: string, timeDuration?: DateTimeUnit, properties?: string[]): Promise<number> {
    console.log(timezone);
    const query = Archive.query() //
      .where("isAnomaly", true);

    if (timeDuration) {
      const now = DateTime.now().setZone(timezone); // user's timezone
      const startOfDuration: DateTime = now.startOf(timeDuration).toUTC();
      const endOfDuration: DateTime = now.endOf(timeDuration).toUTC();
      query.whereBetween("timestamp", [startOfDuration, endOfDuration]);
    }

    if (properties) {
      query //
        .whereHas(
          "gensetProperty", //
          (builder) => builder.whereIn("propertyName", properties)
        );
    }
    const res = await query.count("*").pojo();
    return parseInt(res[0].count);
  }

 static async getAnomalyCount(timezone?: string, timeDuration?: DateTimeUnit, properties?: string[]) {
    const query = Archive.query().where("isAnomaly", true);

    if (timeDuration && timezone) {
      const now = DateTime.now().setZone(timezone);
      const start = now.startOf(timeDuration).toUTC();
      const end = now.endOf(timeDuration).toUTC();
      query.whereBetween("timestamp", [start, end]);
    }

    if (properties) {
      query.whereHas("gensetProperty", (q) => q.whereIn("propertyName", properties));
    }

    const result = await query.count("*").pojo();
    return parseInt(result[0].count);
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

        return {
          ...entry,
          today,
          week,
          month,
          year,
          total,
        };
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

}
