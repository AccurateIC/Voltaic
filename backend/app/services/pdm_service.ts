import MaintenanceNotification from "#models/maintenance_notification";
import { HttpContext } from "@adonisjs/core/http";
import { getPdmStatisticsValidator } from "#validators/pdm";
import { DateTime, DateTimeUnit } from "luxon";

export class PdmService {
  /**
   * Unified method: accepts either HttpContext OR timezone + timeDuration directly
   */
  static async maintenanceNotificationStatistics(ctxOrTimezone: HttpContext | string, timeDurationParam?: DateTimeUnit) {
    let timezone: string;
    let timeDuration: DateTimeUnit;

    // Case 1: Called from controller with HttpContext
    if (typeof ctxOrTimezone !== "string") {
      const { request } = ctxOrTimezone;
      const reqBody = await request.validateUsing(getPdmStatisticsValidator);
      console.log("reqBody PDM", reqBody);

      timezone = reqBody.headers.timezone;
      timeDuration = reqBody.timeDuration;
    }
    // Case 2: Called programmatically with timezone + timeDuration
    else {
      timezone = ctxOrTimezone;
      timeDuration = timeDurationParam!;
    }

    if (!timezone) throw new Error("No timezone provided");
    if (!timeDuration) throw new Error("No time duration provided");

    const now = DateTime.now().setZone(timezone);
    const start = now.startOf(timeDuration).toUTC();
    const end = now.endOf(timeDuration).toUTC();

    const query = MaintenanceNotification.query().whereBetween("timestamp", [start, end]);

    switch (timeDuration) {
      case "week":
        return {
          meta: { timeDuration },
          data: await query.select("day", "month", "year").count("id").groupBy("day", "month", "year").orderBy("day").pojo(),
        };

      case "month":
        return {
          meta: { timeDuration },
          data: await query
            .select("week", "month", "year")
            .count("id")
            .groupBy("week", "month", "year")
            .orderBy("week")
            .pojo(),
        };

      case "year":
        return {
          meta: { timeDuration },
          data: await query.select("month", "year").count("id").groupBy("month", "year").orderBy("month").pojo(),
        };

      default:
        throw new Error("Invalid time duration");
    }
  }
}

// // backend/app/services/pdm_service.ts
// import MaintenanceNotification from "#models/maintenance_notification";
// import { HttpContext } from "@adonisjs/core/http";
// import { getPdmStatisticsValidator } from "#validators/pdm";
// import { DateTime, DateTimeUnit } from "luxon";

// export class PdmService {

//     static async maintenanceNotificationStatistics({ request }: HttpContext) {
//     const reqBody = await request.validateUsing(getPdmStatisticsValidator);
//       console.log("reqBody  PDM", reqBody);
//     const timezone = reqBody.headers.timezone;
//     const timeDuration = reqBody.timeDuration;

//     if (!timezone) throw new Error("no timezone provided");
//     if (!timeDuration) throw new Error("no time duration provided");

//     const now = DateTime.now().setZone(timezone);
//     const start = now.startOf(timeDuration).toUTC();
//     const end = now.endOf(timeDuration).toUTC();

//     const query = MaintenanceNotification.query().whereBetween("timestamp", [start, end]);

//     switch (timeDuration) {
//       case "week":
//         return {
//           meta: { timeDuration },
//           data: await query
//             .select("day", "month", "year")
//             .count("id")
//             .groupBy("day", "month", "year")
//             .orderBy("day")
//             .pojo(),
//         };

//       case "month":
//         return {
//           meta: { timeDuration },
//           data: await query
//             .select("week", "month", "year")
//             .count("id")
//             .groupBy("week", "month", "year")
//             .orderBy("week")
//             .pojo(),
//         };

//       case "year":
//         return {
//           meta: { timeDuration },
//           data: await query
//             .select("month", "year")
//             .count("id")
//             .groupBy("month", "year")
//             .orderBy("month")
//             .pojo(),
//         };

//       default:
//         throw new Error("Invalid time duration");
//     }
//   }
// }

// // // backend/app/services/pdm_service.ts
// // import MaintenanceNotification from "#models/maintenance_notification";
// // import { DateTime, DateTimeUnit } from "luxon";

// // export class PdmService {
// //   static async maintenanceNotificationStatistics(timezone: string, timeDuration: DateTimeUnit) {
// //     const query = MaintenanceNotification.query();

// //     if (!timezone) throw new Error("no timezone provided");
// //     if (!timeDuration) throw new Error("no time duration provided");

// //     const now = DateTime.now().setZone(timezone);
// //     const startOfDuration: DateTime = now.startOf(timeDuration).toUTC();
// //     const endOfDuration: DateTime = now.endOf(timeDuration).toUTC();
// //     query.whereBetween("timestamp", [startOfDuration, endOfDuration]);

// //     switch (timeDuration) {
// //       case "week":
// //         const weekStats = await query //
// //           .select("day", "month", "year")
// //           .count("id")
// //           .groupBy("day", "month", "year")
// //           .orderBy("day")
// //           .pojo();

// //         return {
// //           meta: {
// //             timeDuration,
// //           },
// //           data: weekStats,
// //         };
// //       case "month":
// //         const monthStats = await query //
// //           .select("week", "month", "year")
// //           .count("id")
// //           .groupBy("week", "month", "year")
// //           .orderBy("week")
// //           .pojo();

// //         return {
// //           meta: {
// //             timeDuration,
// //           },
// //           data: monthStats,
// //         };
// //       case "year":
// //         const yearStats = await query //
// //           .select("month", "year")
// //           .count("id")
// //           .groupBy("month", "year")
// //           .orderBy("month")
// //           .pojo();

// //         return {
// //           meta: {
// //             timeDuration,
// //           },
// //           data: yearStats,
// //         };
// //       default:
// //         break;
// //     }
// //   }
// // }
