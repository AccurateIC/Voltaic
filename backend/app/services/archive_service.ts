import Archive from "#models/archive";
import { DateTime, DateTimeUnit } from "luxon";

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
