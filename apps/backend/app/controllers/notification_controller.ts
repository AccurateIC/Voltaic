import Notification from "#models/notification";
import MaintenanceNotification from "#models/maintenance_notification";
import { createNotificationValidator } from "#validators/notification";
import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";
import logger from "@adonisjs/core/services/logger";
import transmit from "@adonisjs/transmit/services/main";
export default class NotificationController {
  // ✅ STEP 1: GET ALL WITH PAGINATION
  async getAll({ request }: HttpContext) {
    const page = Number(request.input("page", 1));
    const limit = Number(request.input("limit", 50));
    const includeResolved = request.input("includeResolved", "false") === "true";
    
    const query = Notification.query()
      .preload("notificationType")
      .preload("archive", (archiveQuery) =>
        archiveQuery.preload("gensetProperty", (gensetQuery) => gensetQuery.preload("physicalQuantity"))
      )
      .orderBy("startedAt", "desc");

    if (!includeResolved) {
      query.where("shouldBeDisplayed", true);
    }

    const notifications = await query.paginate(page, limit);
    
    return {
      data: notifications.all(),
      pagination: {
        page: notifications.currentPage,
        limit: notifications.perPage,
        total: notifications.total,
        pages: notifications.lastPage,
      },
    };
  }

  // ✅ STEP 2: RESOLVE MULTIPLE NOTIFICATIONS
  async resolveMultiple({ request, response }: HttpContext) {
    const { notificationIds } = request.only(['notificationIds']);
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return response.badRequest({
        errors: [{ message: 'notificationIds must be a non-empty array' }]
      });
    }
    
    try {
     logger.info({ notificationIds }, "Attempting to update notifications");
      const updated = await Notification.query()
        .whereIn('id', notificationIds)
        .update({ 
          shouldBeDisplayed: false,
          finishedAt: DateTime.now().toSQL() // Ensure it's marked as finished
        });
      
      logger.info({ updated }, "Notifications updated count");
      
    // After updating, fetch the new count immediately in the same request
      const [anomalyRows, maintenanceRows] = await Promise.all([
        Notification.query().where("shouldBeDisplayed", true).count("* as total"),
        MaintenanceNotification.query().where("shouldBeDisplayed", true).count("* as total"),
      ]);

      transmit.broadcast("notification", { message: "notification table updated" });
      return response.ok({
        resolved: updated,
        total: notificationIds.length,
        message: `Successfully resolved ${updated} notifications`,
        newCounts: {
          anomaly: Number(anomalyRows[0].$extras.total),
          maintenance: Number(maintenanceRows[0].$extras.total),
        },
      });
    } catch (error) {
     logger.error({ err: error }, "Error resolving notifications");
      return response.internalServerError({
        errors: [{ message: error.message || 'Failed to resolve notifications' }]
      });
    }
  }
  

  // GET RESOLVED
  async getResolved({}: HttpContext) {
    return await Notification.query()
      .where("shouldBeDisplayed", false)
      .orderBy("startedAt", "desc")
      .preload("notificationType")
      .preload("archive", (archiveQuery) =>
        archiveQuery.preload("gensetProperty", (gensetQuery) => gensetQuery.preload("physicalQuantity"))
      );
  }

  // GET UNRESOLVED
  async getUnresolved({}: HttpContext) {
    return await Notification.query()
      .where("shouldBeDisplayed", true)
      .orderBy("startedAt", "desc")
      .preload("notificationType")
      .preload("archive", (archiveQuery) =>
        archiveQuery.preload("gensetProperty", (gensetQuery) => gensetQuery.preload("physicalQuantity"))
      );
  }

  // MARK AS READ
  async read({ params }: HttpContext) {
    const notification = await Notification.findOrFail(params.id);
    notification.shouldBeDisplayed = false;
    notification.finishedAt = DateTime.now();
    await notification.save();
    transmit.broadcast("notification", { message: "notification table updated" });
    return notification;
  }

  // CREATE
  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createNotificationValidator);
    const createdNotification = await Notification.create({
      ...data,
      startedAt: DateTime.fromJSDate(data.startedAt),
      finishedAt: data.finishedAt ? DateTime.fromJSDate(data.finishedAt) : null,
    });
    transmit.broadcast("notification", { message: "notification table updated" });
    return createdNotification;
  }

  // UPDATE
  async update({ response }: HttpContext) {
    return response.status(400).send({ message: "Not Implemented" });
  }


 // ✅ NEW: CLEAR RESOLVED ANOMALY RECORDS BY PERIOD
async clearRecords({ request, response }: HttpContext) {
  try {
    const { period } = request.only(['period']);
    
    let daysToDelete = 1;
    if (period === '1week') daysToDelete = 7;
    if (period === '1month') daysToDelete = 30;
    
    const cutoffDate = DateTime.now().minus({ days: daysToDelete });
    
    const result = await Notification.query()
      .where('shouldBeDisplayed', false)
      .where('finishedAt', '<=', cutoffDate.toSQL())
      .delete();
    
    transmit.broadcast("notification", { message: "notification table updated" });
    return response.ok({
      success: true,
      deleted: result,
      message: `Deleted ${result} anomaly records from last ${period}`,
    });
    
  } catch (error) {
    return response.internalServerError({ 
      error: error.message,
      message: 'Failed to clear records'
    });
  }
}

  async getSummary({}: HttpContext) {
    const [anomalyResolved, anomalyUnresolved, maintenanceResolved, maintenanceUnresolved] = await Promise.all([
      Notification.query().where("shouldBeDisplayed", false).orderBy("startedAt", "desc")
        .preload("notificationType")
        .preload("archive", (q) => q.preload("gensetProperty", (q2) => q2.preload("physicalQuantity"))),
      Notification.query().where("shouldBeDisplayed", true).orderBy("startedAt", "desc")
        .preload("notificationType")
        .preload("archive", (q) => q.preload("gensetProperty", (q2) => q2.preload("physicalQuantity"))),
      MaintenanceNotification.query().where("shouldBeDisplayed", false).orderBy("timestamp", "desc"),
      MaintenanceNotification.query().where("shouldBeDisplayed", true).orderBy("timestamp", "desc"),
    ]);

    return {
      anomaly: { resolved: anomalyResolved, unresolved: anomalyUnresolved },
      maintenance: { resolved: maintenanceResolved, unresolved: maintenanceUnresolved },
    };
  }
 async summary({}: HttpContext) {
  const [anomalyResolved, anomalyUnresolved, maintenanceResolved, maintenanceUnresolved] = await Promise.all([
   Notification.query()
  .where("shouldBeDisplayed", false)
  .orderBy("startedAt", "desc")
  .limit(20)                        // 👈 ADD THIS
  .preload("notificationType")
  .preload("archive", (q) => q.preload("gensetProperty", (q2) => q2.preload("physicalQuantity"))),
Notification.query()
  .where("shouldBeDisplayed", true)
  .orderBy("startedAt", "desc")
  .limit(20)                        // 👈 ADD THIS
  .preload("notificationType")
  .preload("archive", (q) => q.preload("gensetProperty", (q2) => q2.preload("physicalQuantity"))),
MaintenanceNotification.query()
  .where("shouldBeDisplayed", false)
  .orderBy("timestamp", "desc")
  .limit(20),                       // 👈 ADD THIS
MaintenanceNotification.query()
  .where("shouldBeDisplayed", true)
  .orderBy("timestamp", "desc")
  .limit(20),                       // 👈 ADD THIS
  ]);

  return {
    anomaly: { resolved: anomalyResolved, unresolved: anomalyUnresolved },
    maintenance: { resolved: maintenanceResolved, unresolved: maintenanceUnresolved },
  };
}

  // ✅ LIGHTWEIGHT: Returns only unresolved counts — no preloads, tiny response (~50 bytes)
  // Used by Navbar bell badge via SSE-driven invalidation instead of full summary
  async count({}: HttpContext) {
    const [anomalyRows, maintenanceRows] = await Promise.all([
      Notification.query().where("shouldBeDisplayed", true).count("* as total"),
      MaintenanceNotification.query().where("shouldBeDisplayed", true).count("* as total"),
    ]);
    return {
      anomaly: Number(anomalyRows[0].$extras.total),
      maintenance: Number(maintenanceRows[0].$extras.total),
    };
  }
  async anomalyStatsCount({}: HttpContext) {
  const now = DateTime.local();
  const todayStart = now.startOf("day").toSQL();
  const weekStart = now.startOf("week").toSQL();
  const monthStart = now.startOf("month").toSQL();

  const [todayRows, weekRows, monthRows] = await Promise.all([
    Notification.query()
      .where("shouldBeDisplayed", true)
      .where("startedAt", ">=", todayStart)
      .count("* as total"),

    Notification.query()
      .where("shouldBeDisplayed", true)
      .where("startedAt", ">=", weekStart)
      .count("* as total"),

    Notification.query()
      .where("shouldBeDisplayed", true)
      .where("startedAt", ">=", monthStart)
      .count("* as total"),
  ]);

  return {
    today: Number(todayRows[0].$extras.total),
    week: Number(weekRows[0].$extras.total),
    month: Number(monthRows[0].$extras.total),
  };
}
}