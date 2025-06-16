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
import { DateTime, DateTimeUnit } from "luxon";
import { ArchiveService } from "#services/archive_service";

export default class ArchiveController {
  async getPropertyStatistics({ request }: HttpContext) {
    const data = await request.validateUsing(getPropertyStatisticsValidator);
    const timezone: string = data.headers.timezone;
    const timeDuration: DateTimeUnit = data.timeDuration;
    const now = DateTime.now().setZone(timezone).toUTC();
    const startOfDuration = now.startOf(timeDuration).toJSDate();
    const endOfDuration = now.endOf(timeDuration).toJSDate();

    let responseData;

    switch (timeDuration) {
      case "day": // show data averaged hourly
        // not implemented
        break;
      case "week": // show data averaged daily
        responseData = await Archive.query() //
          .select("day", "month", "year", "genset_property_id")
          .whereHas("gensetProperty", (propertyQuery) => {
            propertyQuery.where("propertyName", data.propertyName);
          })
          .whereBetween("timestamp", [startOfDuration, endOfDuration])
          .avg("property_value")
          .groupBy("day", "month", "year", "genset_property_id")
          .orderBy("genset_property_id", "asc")
          .pojo();

        responseData = {
          meta: {
            timeDuration,
            averaged: "daily",
          },
          data: responseData,
        };

        break;
      case "month": // show data averaged weekly
        responseData = await Archive.query() //
          .select("week", "month", "year", "genset_property_id")
          .whereHas("gensetProperty", (propertyQuery) => {
            propertyQuery.where("propertyName", data.propertyName);
          })
          .whereBetween("timestamp", [startOfDuration, endOfDuration])
          .avg("property_value")
          .groupBy("week", "month", "year", "genset_property_id")
          .orderBy("genset_property_id", "asc")
          .pojo();

        responseData = {
          meta: {
            timeDuration,
            averaged: "daily",
          },
          data: responseData,
        };

        break;
      case "year": // show data averaged monthly
        responseData = await Archive.query() //
          .select("month", "year", "genset_property_id")
          .whereHas("gensetProperty", (propertyQuery) => {
            propertyQuery.where("propertyName", data.propertyName);
          })
          .whereBetween("timestamp", [startOfDuration, endOfDuration])
          .avg("property_value")
          .groupBy("month", "year", "genset_property_id")
          .orderBy("genset_property_id", "asc")
          .pojo();

        responseData = {
          meta: {
            timeDuration,
            averaged: "daily",
          },
          data: responseData,
        };

        break;
      default:
        break;
    }

    return responseData;
  }

  async getAll({}: HttpContext) {
    const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
    return archiveData;
  }

  async getPaginated({ request }: HttpContext) {
    const requestData = await request.validateUsing(getPaginatedDataValidator);
    console.log(requestData);

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

    // pagination
    const archiveData = await archiveQuery.paginate(requestData.page);

    return archiveData;
  }

  async getBetween({ request }: HttpContext) {
    // console.log(request.qs());
    const queryParams = request.qs();
    // console.log(queryParams);
    const data = await getArchiveDataBetweenValidator.validate(queryParams);
    // console.log("Data", data);
    // const data = await request.qs().validateUsing(getArchiveDataBetweenValidator);
    const archiveData = await Archive.query()
      .whereBetween("timestamp", [data.from, data.to])
      .preload("gensetProperty", (query) => query.preload("physicalQuantity"));
    return archiveData;
  }

  async getPropertyDataBetween({ request }: HttpContext) {
    const data = await request.validateUsing(getArchiveDataPropertyBetweenValidator);

    const query = Archive.query();

    // filter by time
    if (data.from && data.to) {
      query.whereBetween("timestamp", [data.from, data.to]);
    } else {
      console.log("unexpected");
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

    const propertyData = await query.exec();

    return propertyData;
  }

  // TODO: maybe handle case when no entries are present in the database
  async getLatest({}: HttpContext) {
    return ArchiveService.getLatestEntries();
  }

  async create({ request }: HttpContext) {
    const payload = await request.validateUsing(createArchiveValidator);
    const timestamp = DateTime.fromJSDate(payload.timestamp);
    const data = payload.data;

    // begin db transaction
    const trxResult = await db.transaction(async (trx) => {
      try {
        // fetch all genset properties
        const propertyNames: string[] = data.map((element) => element.property);
        const gensetProperties = await GensetProperty.query({ client: trx }).whereIn("propertyName", propertyNames).exec();

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
        for (const archive of insertedArchives) {
          const property = propertyMap.get(data[insertedArchives.indexOf(archive)].property)!;
          const activeNotification = activeNotificationMap.get(property.propertyName);

          // console.log("ARCHIVE", archive);
          // console.log("PROPERTY", property);

          const phyQty = await PhysicalQuantity.find(property.physicalQuantityId);
          const unit = phyQty?.unitSymbol;

          if (archive.isAnomaly) {
            if (!activeNotification) {
              newNotifications.push({
                summary: `Anomaly detected for ${property.readablePropertyName}`,
                message: `Property value: ${archive.propertyValue}${unit}`,
                archiveId: archive.id,
                shouldBeDisplayed: true,
                notificationTypeId: 3,
                startedAt: timestamp,
                finishedAt: null,
              });
            }
          } else if (activeNotification) {
            // close
            notificationUpdates.push({
              id: activeNotification.id,
              finishedAt: timestamp,
            });
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
            .update({ finishedAt: update.finishedAt, shouldBeDisplayed: false });
          // transmit.broadcast("notification", {
          //   message: "notification table updated",
          // });
        }

        return { insertedArchives, newNotifications, notificationUpdates };
      } catch (error) {
        // Log the error for debugging
        console.error("Transaction failed:", error);
        throw error; // Re-throw to trigger rollback
      }
    });

    // broadcast after transaction completes
    // Broadcast event
    transmit.broadcast("archive", {
      message: "new entry created",
    });
    transmit.broadcast("notification", { message: "notification table updated" });
    if (trxResult.newNotifications.length > 0 || trxResult.notificationUpdates.length > 0) {
    }

    // console.log(trxResult);

    return trxResult;
  }

  async getAnomalyStatistics({ request, response }: HttpContext) {
    const data = await request.validateUsing(getAnomalyStatisticsValidator);
    const timezone = data.headers.timezone;

    // check if timezone str is a valid IANA timezone identifier
    try {
      const now = DateTime.now().setZone(timezone);
      if (!now.isValid) {
        return response.status(400).json({
          error: "Invalid timezone",
          message: `'${timezone}' is not a valid IANA timezone identifier`,
          details: now.invalidReason,
        });
      }
    } catch (error) {
      return response.status(400).json({
        error: "Invalid timezone",
        message: `'${timezone}' is not a valid IANA timezone identifier`,
        details: error.message,
      });
    }

    // Get property-based stats with preloaded relationships
    const propertyStats = (
      await Archive.query()
        .where("isAnomaly", 1)
        .preload("gensetProperty")
        .select("gensetPropertyId")
        .groupBy("gensetPropertyId")
    ).map((value) => ({
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

        return {
          ...entry,
          today: todaysTotal,
          week: weekTotal,
          month: monthTotal,
          year: yearTotal,
          total: totalCount,
        };
      })
    );

    const totalCount = await ArchiveService.getAnomalyCount();
    const todaysTotal = await ArchiveService.getAnomalyCount(timezone, "day");
    const weekTotal = await ArchiveService.getAnomalyCount(timezone, "week");
    const yearTotal = await ArchiveService.getAnomalyCount(timezone, "year");
    const monthTotal = await ArchiveService.getAnomalyCount(timezone, "month");

    return {
      timezone, // Include timezone in response for clarity
      overall: {
        today: todaysTotal,
        week: weekTotal,
        month: monthTotal,
        year: yearTotal,
        total: totalCount,
      },
      byProperty: propertyStatsByTime,
    };
  }

  async delete({ response }: HttpContext) {
    response.status(400).send({ message: "Not Implemented" });
  }

  async deleteAll({}: HttpContext) {
    await Notification.query().delete();
    const archive = await Archive.query().delete();
    return archive;
  }
}
