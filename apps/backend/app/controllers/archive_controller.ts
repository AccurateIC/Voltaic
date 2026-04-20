import {
  createArchiveValidator,
  getAnomalyStatisticsValidator,
  getArchiveDataBetweenValidator,
  getArchiveDataPropertyBetweenValidator,
  getPaginatedDataValidator,
  getPropertyStatisticsValidator,
} from "#validators/archive";
import Archive from "#models/archive";
import Notification from "#models/notification";
import GensetProperty from "#models/genset_property";
import type { HttpContext } from "@adonisjs/core/http";
import transmit from "@adonisjs/transmit/services/main";
import db from "@adonisjs/lucid/services/db";
import PhysicalQuantity from "#models/physical_quantity";
import { DateTime } from "luxon";
import { ArchiveService, PropertyStatisticsResponse } from "#services/archive_service";
import { Exception } from "@adonisjs/core/exceptions";
import { errors } from "@vinejs/vine";
import ValidationException from "#exceptions/validation_exception";
import { catchErrTyped } from "@voltaic/err";
import NotificationType from "#models/notification_type";
import Role from "#models/role";
import { UUID } from "node:crypto";
import { ModelPaginatorContract } from "@adonisjs/lucid/types/model";
import logger from "@adonisjs/core/services/logger";
import env from "#start/env";
interface PaginatedArchiveResponse {
  data: Archive[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
}

interface AnomalyStatisticsResponse {
  timezone: string;
  overall: { today: number; week: number; month: number; year: number; total: number };
  byProperty: {
    today: number;
    week: number;
    month: number;
    year: number;
    total: number;
    readablePropertyName: string;
    gensetPropertyId: UUID; // assuming UUID is a string
    propertyName: string;
  }[];
}

export default class ArchiveController {
  async getPropertyStatistics({ request }: HttpContext): Promise<PropertyStatisticsResponse> {
    const data = await request.validateUsing(getPropertyStatisticsValidator);
    switch (data.timeDuration) {
      case "week": // show data averaged daily
        return ArchiveService.getPropertyStatisticsForWeek(data.headers.timezone, data.propertyName);
      case "month": // show data averaged weekly
        return ArchiveService.getPropertyStatisticsForMonth(data.headers.timezone, data.propertyName);
      case "year": // show data averaged monthly
        return ArchiveService.getPropertyStatisticsForYear(data.headers.timezone, data.propertyName);
      default:
        throw new Exception("Unexpected Branch", { status: 500 });
    }
  }

async getAll({}: HttpContext) {
  // Safety wrapper — was previously unlimited, now capped at 50 records
  logger.warn("archive/getAll called — returning first 50 records only. Use getPaginated instead.");
  const archiveData = await Archive.query()
    .preload("gensetProperty", (query) => query.preload("physicalQuantity"))
    .orderBy("timestamp", "desc")
    .limit(50);
  return archiveData;
}

  async getPaginated({ request }: HttpContext): Promise<PaginatedArchiveResponse> {
    const requestData = await request.validateUsing(getPaginatedDataValidator);
    logger.info({ requestData }, "Paginated request data");

    // start building the select query
    const archiveQuery = Archive.query();

    // FILTERING

    // filter by timestamp range
    if (requestData.from && requestData.to) {
      archiveQuery.whereBetween("timestamp", [requestData.from, requestData.to]);
    } else if (requestData.from) {
      archiveQuery.where("timestamp", ">=", requestData.from);
    } else if (requestData.to) {
      archiveQuery.where("timestamp", "<=", requestData.to);
    }

    // filter property name
    if (requestData?.propertyNames && requestData.propertyNames.length > 0) {
      const propertyNames = requestData.propertyNames;
      archiveQuery.whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.whereIn("propertyName", propertyNames);
      });
    }

    // filter anomalies
    if (requestData?.isAnomaly !== undefined) {
      archiveQuery.where("isAnomaly", requestData.isAnomaly ? 1 : 0);
    }

    // preload
    archiveQuery.preload("gensetProperty", (preloadQuery) => {
      preloadQuery.preload("physicalQuantity");
    });

    // order by timestamp descending (most recent first)
    archiveQuery.orderBy("timestamp", "desc");

    const archiveData: ModelPaginatorContract<Archive> = await archiveQuery.paginate(requestData.page);

    const serialized = archiveData.serialize();
    return { data: serialized.data as Archive[], meta: serialized.meta };
  }

 async getBetween({ request }: HttpContext) {
    const queryParams = request.qs();
    // Add page and loadAll parameters
    const page = parseInt(queryParams.page || "1");
    const loadAll = queryParams.loadAll === "true";
    
    const data = await getArchiveDataBetweenValidator.validate(queryParams);
    
    const query = Archive.query()
      .whereBetween("timestamp", [data.from, data.to])
      .select("id", "timestamp", "propertyValue", "isAnomaly", "gensetPropertyId")
      .orderBy("timestamp", "desc")
      .preload("gensetProperty", (q) => q.preload("physicalQuantity"));

    // MODE 1: Load 1000 records only (FAST) ✅
    if (!loadAll) {
      const pageSize = 1000;
      const offset = (page - 1) * pageSize;
      
      const archiveData = await query.limit(pageSize).offset(offset);
      
      // Get total count
      const countQuery = Archive.query()
        .whereBetween("timestamp", [data.from, data.to]);
      const totalResult = await countQuery.count("* as total");
      const total = totalResult[0]?.total || 0;
      
      return {
        data: archiveData,
        mode: "limited",
        pagination: {
          total: total,
          page: page,
          pageSize: pageSize,
          pages: Math.ceil(total / pageSize)
        }
      };
    }
    
    // MODE 2: Load ALL records (SLOW but complete) ⚠️
    const allData = await query;
    return {
      data: allData,
      mode: "all",
      total: allData.length,
      warning: "This may take 30-60 seconds"
    };
}

  async getPropertyDataBetween({ request }: HttpContext) {
    try {
      const { data, error, success } = await catchErrTyped(
        request.validateUsing(getArchiveDataPropertyBetweenValidator),
        [errors.E_VALIDATION_ERROR]
      );
      if (!success) throw new ValidationException(error.messages);
      const query = Archive.query();

      // filter by time
      if (data.from && data.to) {
        query.whereBetween("timestamp", [data.from, data.to]);
      } else {
       logger.warn("Unexpected case: missing from/to in getPropertyDataBetween");
      }

      // filter by property names
      if (data?.properties) {
        const propertyNames = data.properties;
        query.whereHas("gensetProperty", (propertyQuery) => {
          propertyQuery.whereIn("propertyName", propertyNames);
        });
      }

      // preload
      query.preload("gensetProperty", (preloadQuery) => {
        preloadQuery.preload("physicalQuantity");
      });

      // latest first
      query.orderBy("timestamp", "desc");
      query.limit(1000);

      const propertyData = await query.exec();

      return propertyData;
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        throw new ValidationException(error.messages);
      }
    }
  }

  // TODO: maybe handle case when no entries are present in the database
  async getLatest({}: HttpContext) {
    return ArchiveService.getLatestEntries();
  }

async create({ request, response }: HttpContext) {
  const apiKey = request.header("x-api-key");

if (apiKey !== env.get("ML_API_KEY")) {
    return response.status(401).json({ message: "Unauthorized" });
  }
  const payload = await request.validateUsing(createArchiveValidator);
    // Convert timestamp properly - if it's an ISO string with timezone, keep it as is
    let timestamp: DateTime;
    if (typeof payload.timestamp === 'string') {
      // Parse the ISO string directly to preserve the timezone
      timestamp = DateTime.fromISO(payload.timestamp);
    } else {
      // Fallback for Date objects
      timestamp = DateTime.fromJSDate(payload.timestamp);
    }
    
    logger.info(
  { original: payload.timestamp, parsed: timestamp.toISO() },
  "Received timestamp"
);
    
    const data = payload.data;

    const alertNotificationType = await NotificationType.findByOrFail("type", "alert");

    // begin db transaction
    const trxResult = await db.transaction(async (trx) => {
      try {
        
        // fetch all genset properties
        const propertyNames: string[] = data.map((element) => element.property);
        const gensetProperties = await GensetProperty.query({ client: trx })
          .whereIn("propertyName", propertyNames)
          .exec();

        // create hash map for efficient property lookup
        const propertyMap = new Map(gensetProperties.map((prop) => [prop.propertyName, prop]));

        // prepare archive data
        const archiveData = data.map((element) => ({
          timestamp,
          // day: timestamp.day,
          // week: timestamp.weekNumber,
          // month: timestamp.month,
          // year: timestamp.year,
          gensetPropertyId: propertyMap.get(element.property)!.id,
          propertyValue: element.value,
          isAnomaly: element.is_anomaly,
        }));

        // bulk insert archives
        const insertedArchives = await Archive.createMany(archiveData, { client: trx });
        // console.log("inserted archives", insertedArchives);

        //
        // process notifications
        //
        const activeNotifications = await Notification.query({ client: trx })
          .whereNull("finishedAt")
          .preload("archive", (query) => {
            query.preload("gensetProperty");
          })
          .exec();

        // console.log("active notifications", activeNotifications);

        const notificationUpdates = [];
        const newNotifications = [];

        const activeNotificationMap = new Map();
        activeNotifications.forEach((notification) => {
          const propertyName = notification.archive.gensetProperty.propertyName;
          if (!activeNotificationMap.has(propertyName)) {
            activeNotificationMap.set(propertyName, notification);
          }
        });

        // process each archive entry for notifications
        for (let i = 0; i < insertedArchives.length; i++) {
          const archive = insertedArchives[i];
          const property = propertyMap.get(data[i].property)!;
          const activeNotification = activeNotificationMap.get(property.propertyName);

          const phyQty = await PhysicalQuantity.find(property.physicalQuantityId);
          const unit = phyQty?.unitSymbol;

          // DEBUGGING
          // console.log(`Checking property ${property.propertyName}: isAnomaly=${archive.isAnomaly}, hasActive=${!!activeNotification}`);

          if (archive.isAnomaly) {
            if (!activeNotification) {
              // Add to activeNotificationMap to avoid duplicate notifications in the same batch
              const newNotif = {
                summary: `Anomaly detected for ${property.readablePropertyName}`,
                message: `Property value: ${archive.propertyValue}${unit}`,
                archiveId: archive.id,
                shouldBeDisplayed: true,
                notificationTypeId: alertNotificationType.id,
                startedAt: timestamp,
                finishedAt: null,
              };
              newNotifications.push(newNotif);
              activeNotificationMap.set(property.propertyName, newNotif);
            }
          } else if (activeNotification && activeNotification.id) {
            // close by setting finishedAt, but KEEP shouldBeDisplayed: true
            // so the user has to manually resolve it
            notificationUpdates.push({ id: activeNotification.id, finishedAt: timestamp });
            activeNotificationMap.delete(property.propertyName);
          }
        }

        // bulk create new notifications and update existing ones
        if (newNotifications.length > 0) {
          await Notification.createMany(newNotifications, { client: trx });
          // transmit.broadcast("notification", {
          //   message: "notification table updated",
          // });
        }

        for (const update of notificationUpdates) {
          await Notification.query({ client: trx })
            .where("id", update.id)
            .update({ finishedAt: update.finishedAt });
          // transmit.broadcast("notification", {
          //   message: "notification table updated",
          // });
        }

        return { insertedArchives, newNotifications, notificationUpdates };
      } catch (error) {
        // Log the error for debugging
       logger.error({ err: error }, "Transaction failed");
        throw error; // Re-throw to trigger rollback
      }
    });

    // broadcast after transaction completes
    // Broadcast event with anomaly info for real-time chart updates
    transmit.broadcast("archive", {
      message: "new entry created",
      anomalyCount: trxResult.newNotifications.length,
      hasAnomalies: trxResult.newNotifications.length > 0,
    });
    transmit.broadcast("notification", { message: "notification table updated" });
    if (trxResult.newNotifications.length > 0 || trxResult.notificationUpdates.length > 0) {
    }

    // console.log(trxResult);

    return trxResult;
  }

  async getAnomalyStatistics({ request }: HttpContext): Promise<AnomalyStatisticsResponse> {
    const data = await request.validateUsing(getAnomalyStatisticsValidator);
    const timezone = data.headers.timezone;

    // check if timezone str is a valid IANA timezone identifier
    try {
      const now = DateTime.now().setZone(timezone);
      if (!now.isValid) {
        throw new Exception(`${timezone} is not a valid IANA timezone identifier`, {
          status: 400,
          code: "E_INVALID_TIMEZONE",
        });
      }
    } catch (error) {
      throw new Exception(`${timezone} is not a valid IANA timezone identifier`, {
        status: 400,
        code: "E_INVALID_TIMEZONE",
      });
    }

    // Get property-based stats with preloaded relationships
    const gensetProperty = await Archive.query()
      .where("isAnomaly", 1)
      .preload("gensetProperty")
      .select("gensetPropertyId")
      .groupBy("gensetPropertyId");
    const propertyStats = gensetProperty.map((value) => ({
      readablePropertyName: value.gensetProperty.readablePropertyName,
      gensetPropertyId: value.gensetPropertyId,
      propertyName: value.gensetProperty.propertyName,
    }));

    // Get counts for each time period by property
    const propertyStatsByTime = await Promise.all(
      propertyStats.map(async (entry) => {
        const todaysTotal = await ArchiveService.getAnomalyCount(timezone, "day", [entry.propertyName]);
        const weekTotal = await ArchiveService.getAnomalyCount(timezone, "week", [entry.propertyName]);
        const monthTotal = await ArchiveService.getAnomalyCount(timezone, "month", [entry.propertyName]);
        const yearTotal = await ArchiveService.getAnomalyCount(timezone, "year", [entry.propertyName]);
        const totalCount = await ArchiveService.getAnomalyCount(undefined, undefined, [entry.propertyName]);

        return { ...entry, today: todaysTotal, week: weekTotal, month: monthTotal, year: yearTotal, total: totalCount };
      })
    );

    const totalCount = await ArchiveService.getAnomalyCount();
    const todaysTotal = await ArchiveService.getAnomalyCount(timezone, "day");
    const weekTotal = await ArchiveService.getAnomalyCount(timezone, "week");
    const yearTotal = await ArchiveService.getAnomalyCount(timezone, "year");
    const monthTotal = await ArchiveService.getAnomalyCount(timezone, "month");

    return {
      timezone, // include timezone in response for clarity
      overall: { today: todaysTotal, week: weekTotal, month: monthTotal, year: yearTotal, total: totalCount },
      byProperty: propertyStatsByTime,
    };
  }

  async delete({ request, response }: HttpContext) {
  const { ids } = request.body();

  // validation
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return response.status(400).send({
      success: false,
      message: "No record ids provided",
    });
  }

  try {
    const deletedCount = await db.transaction(async (trx) => {
      // first delete related notifications
      await Notification.query({ client: trx })
        .whereIn("archiveId", ids)
        .delete();

      // then delete selected archive records
      const deletedRows = await Archive.query({ client: trx })
        .whereIn("id", ids)
        .delete();

      return deletedRows;
    });

    transmit.broadcast("archive", {
      message: "archive records deleted",
    });

    transmit.broadcast("notification", {
      message: "notification table updated",
    });

    return response.status(200).send({
      success: true,
      message: "Selected records deleted successfully",
      deletedCount,
    });
  } catch (error) {
   logger.error({ err: error }, "Error deleting all archive records");

    return response.status(500).send({
      success: false,
      message: "Failed to delete selected records",
    });
  }
}
async deleteAll({ response, auth }: HttpContext) {
  await auth.authenticate();
  try {
    const deletedCount = await db.transaction(async (trx) => {
      // first delete all related notifications
      await Notification.query({ client: trx }).delete();

      // then delete all archive records
      const deletedRows = await Archive.query({ client: trx }).delete();

      return deletedRows;
    });

    transmit.broadcast("archive", {
      message: "all archive records deleted",
    });

    transmit.broadcast("notification", {
      message: "notification table updated",
    });

    return response.status(200).send({
      success: true,
      message: "All archive records deleted successfully",
      deletedCount,
    });
  } catch (error) {
   logger.error({ err: error }, "Error deleting selected archive records");

    return response.status(500).send({
      success: false,
      message: "Failed to delete all archive records",
    });
  }
}
}
