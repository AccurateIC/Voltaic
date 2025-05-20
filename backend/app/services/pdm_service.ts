// backend/app/services/pdm_service.ts
import MaintenanceNotification from "#models/maintenance_notification";
import { DateTime, DateTimeUnit } from "luxon";

export class PdmService {
  static async maintenanceNotificationStatistics(timezone: string, timeDuration: DateTimeUnit) {
    let data = [];
    const query = MaintenanceNotification.query();

    if (!timezone) throw new Error("no timezone provided");
    if (!timeDuration) throw new Error("no time duration provided");

    const now = DateTime.now().setZone(timezone);
    const startOfDuration: DateTime = now.startOf(timeDuration).toUTC();
    const endOfDuration: DateTime = now.endOf(timeDuration).toUTC();
    console.log(startOfDuration, endOfDuration);
    query.whereBetween("timestamp", [startOfDuration, endOfDuration]);
    if (timeDuration === "week") {
      /*
       * If time duration is 1 week,
       * return number of anomalies per day
       * each maintenance_notification row is an anomaly
       * the database has columns such as id, timestamp
       * for instance:
       * {
       *    "19/05/2025": 5, // monday
       *    "20/05/2025": 3, // tuesday
       *    ...
       *    "25/05/2025": 15 // sunday
       * }
       * */

      const notifications = await query.select("timestamp");
      let currentDate = startOfDuration;
      const anomaliesPerDay: Record<string, number> = {};
      while (currentDate <= endOfDuration) {
        anomaliesPerDay[currentDate.toFormat("dd/MM/yyyy")] = 0;
        currentDate = currentDate.plus({ days: 1 });
      }

      notifications.forEach((notification) => {
        const dt: DateTime = DateTime.fromJSDate(notification.timestamp).setZone(timezone);
        const dateKey = dt.toFormat("dd/MM/yyyy");

        anomaliesPerDay[dateKey] += 1;
      });

      return anomaliesPerDay;
    }
  }
}

