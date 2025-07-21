// backend/app/services/pdm_service.ts
import MaintenanceNotification from "#models/maintenance_notification";
import { DateTime, DateTimeUnit, DayNumbers, MonthNumbers, WeekNumbers } from "luxon";

export interface MaintenanceNotificationCount {
  day?: DayNumbers;
  week?: WeekNumbers;
  month: MonthNumbers;
  year: number;
  count: number;
}

export interface MaintenanceNotificationStatisticsResponse {
  meta: { timeDuration: DateTimeUnit };
  data: MaintenanceNotificationCount[];
}

export class PdmService {
  static async maintenanceNotificationStatistics(
    timezone: string,
    timeDuration: DateTimeUnit
  ): Promise<MaintenanceNotificationStatisticsResponse> {
    const query = MaintenanceNotification.query();

    if (!timezone) throw new Error("no timezone provided");
    if (!timeDuration) throw new Error("no time duration provided");

    const now = DateTime.now().setZone(timezone);
    const startOfDuration: Date = now.startOf(timeDuration).toUTC().toJSDate();
    const endOfDuration: Date = now.endOf(timeDuration).toUTC().toJSDate();
    query.whereBetween("timestamp", [startOfDuration, endOfDuration]);

    switch (timeDuration) {
      case "week":
        const weekStats = (await query //
          .select("day", "month", "year")
          .count("id")
          .groupBy("day", "month", "year")
          .orderBy("day")
          .pojo()) as MaintenanceNotificationCount[];

        return { meta: { timeDuration }, data: weekStats };

      case "month":
        const monthStats = (await query //
          .select("week", "month", "year")
          .count("id")
          .groupBy("week", "month", "year")
          .orderBy("week")
          .pojo()) as MaintenanceNotificationCount[];

        return { meta: { timeDuration }, data: monthStats };
      case "year":
        const yearStats = (await query //
          .select("month", "year")
          .count("id")
          .groupBy("month", "year")
          .orderBy("month")
          .pojo()) as MaintenanceNotificationCount[];

        return { meta: { timeDuration }, data: yearStats };
      default:
        throw new Error(`Unsupported time duration: ${timeDuration}`);
    }
  }
}
