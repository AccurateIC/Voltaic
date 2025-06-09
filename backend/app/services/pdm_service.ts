// backend/app/services/pdm_service.ts
import MaintenanceNotification from "#models/maintenance_notification";
import { DateTime, DateTimeUnit } from "luxon";

export class PdmService {
  static async maintenanceNotificationStatistics(timezone: string, timeDuration: DateTimeUnit) {
    const query = MaintenanceNotification.query();

    if (!timezone) throw new Error("no timezone provided");
    if (!timeDuration) throw new Error("no time duration provided");

    const now = DateTime.now().setZone(timezone);
    const startOfDuration: DateTime = now.startOf(timeDuration).toUTC();
    const endOfDuration: DateTime = now.endOf(timeDuration).toUTC();
    query.whereBetween("timestamp", [startOfDuration, endOfDuration]);

    switch (timeDuration) {
      case "week":
        const weekStats = await query //
          .select("day", "month", "year")
          .count("id")
          .groupBy("day", "month", "year")
          .orderBy("day")
          .pojo();

        return {
          meta: {
            timeDuration,
          },
          data: weekStats,
        };
      case "month":
        const monthStats = await query //
          .select("week", "month", "year")
          .count("id")
          .groupBy("week", "month", "year")
          .orderBy("week")
          .pojo();

        return {
          meta: {
            timeDuration,
          },
          data: monthStats,
        };
      case "year":
        const yearStats = await query //
          .select("month", "year")
          .count("id")
          .groupBy("month", "year")
          .orderBy("month")
          .pojo();

        return {
          meta: {
            timeDuration,
          },
          data: yearStats,
        };
      default:
        break;
    }
  }
}
