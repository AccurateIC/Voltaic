import {
  createArchiveValidator,
  getArchiveDataBetweenValidator,
  getArchiveDataPropertyBetweenValidator,
  getPaginatedDataValidator,
} from "#validators/archive";
import Archive from "#models/archive";
import Notification from "#models/notification";
import GensetProperty from "#models/genset_property";
import type { HttpContext } from "@adonisjs/core/http";
import transmit from "@adonisjs/transmit/services/main";
import db from "@adonisjs/lucid/services/db";
import PhysicalQuantity from "#models/physical_quantity";
import { DateTime } from "luxon";

export default class ArchiveController {
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
      archiveQuery.whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.whereIn("propertyName", requestData.propertyNames);
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
    if (data?.properties && data.properties.length > 0) {
      query.whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.whereIn("propertyName", data.properties);
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

  async getLatest({ response }: HttpContext) {
    const latestArchiveEntry = await Archive.query().orderBy("timestamp", "desc").limit(1);

    // when no entries exist, return a 404 with a clear message
    if (!latestArchiveEntry.length) {
      return response.status(404).json({
        message: "No archive entries found",
        data: [],
      });
    }
    const latestTimestamp = latestArchiveEntry[0].timestamp;
    const latestArchiveData = await Archive.query()
      .where("timestamp", latestTimestamp)
      .preload("gensetProperty", (query) => query.preload("physicalQuantity"));

    return latestArchiveData;
  }

  async create({ request }: HttpContext) {
    const payload = await request.validateUsing(createArchiveValidator);
    const timestamp = payload.timestamp;
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

  /*
   * in input i need the time range for which i need to return counts
   *
   * so input may be like: {
   *  timeDuration: "" // options: "*" | "1d" | "1w" | "1m";
   *  selectedProperties: [] // array of properties to be included in count
   * }
   *
   * case *:
   * i need to return counts grouped by month
   * so count in Dec 2024, Jan 2025, Feb 2025
   *
   * case 1d:
   * this is simple
   * i need to count anomalies today for selected properties
   *
   * case 1w:
   * i need to find all the dates in current week
   * for instance may 7 2025 is a wednesday
   * so days in current week are:
   * mon: 5/5/2025
   * tue: 6/5/2025
   * wed: 7/5/2025
   * thu: 8/5/2025
   * fri: 9/5/2025
   * sat: 10/5/2025
   * sun: 11/5/2025
   *
   * so we need to return counts grouped by these dates in the user's timezone
   * and also filtered by selected properties
   *
   *
   * case 1m:
   * i need to find all weeks in the month
   * so
   * week 1: thu 1 may to sun 11 may
   * week 2: mon 12 may to sun 18 may
   * week 3: mon 19 may to sun 25 may
   * week 4: mon 26 may to sat 31 may
   *
   * and i need to return counts for these dates in the user's timezone
   * and also filter by properties
   *
   * */
  async getAnomalyCountsByTimeRange({ request, response }: HttpContext) {
    // Get timezone from request
    const timezone = request.header("timezone");
    if (!timezone) {
      return response.status(400).json({
        error: "Timezone header is required",
        message: "Please provide a valid IANA timezone identifier in the request headers",
      });
    }

    // Validate timezone using Luxon
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

    const requestBody = request.body();
    const timeDuration = requestBody?.timeDuration;
    const selectedProperties = requestBody?.selectedProperties;
  }

  async getAnomalyStatistics({ request, response }: HttpContext) {
    // Get timezone from request
    const timezone = request.header("timezone");
    if (!timezone) {
      return response.status(400).json({
        error: "Timezone header is required",
        message: "Please provide a valid IANA timezone identifier in the request headers",
      });
    }

    // Validate timezone using Luxon
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

    // Get current time in user's timezone
    const now = DateTime.now().setZone(timezone);

    // Get start of today in user's timezone, then convert to UTC for database query
    const todayStart = now.startOf("day").toUTC();

    // Get start of current week in user's timezone, then convert to UTC
    const currentWeekStart = now.startOf("week").toUTC();

    // Get start of current month in user's timezone, then convert to UTC
    const currentMonthStart = now.startOf("month").toUTC();

    // Get property-based stats with preloaded relationships
    const propertyStats = await Archive.query()
      .where("isAnomaly", 1)
      .preload("gensetProperty")
      .select("gensetPropertyId")
      .where("timestamp", ">=", currentMonthStart.toSQL({ includeOffset: true }))
      .groupBy("gensetPropertyId");

    // Get counts for each time period by property
    const propertyStatsByTime = await Promise.all(
      propertyStats.map(async (stat) => {
        const totalCount = await Archive.query()
          .where("isAnomaly", true)
          .where("gensetPropertyId", stat.gensetPropertyId)
          .count("* as count");

        const todayCount = await Archive.query()
          .where("isAnomaly", true)
          .where("gensetPropertyId", stat.gensetPropertyId)
          .where("timestamp", ">=", todayStart.toSQL({ includeOffset: true }))
          .count("* as count");

        const weekCount = await Archive.query()
          .where("isAnomaly", 1)
          .where("gensetPropertyId", stat.gensetPropertyId)
          .where("timestamp", ">=", currentWeekStart.toSQL({ includeOffset: true }))
          .count("* as count");

        const monthCount = await Archive.query()
          .where("isAnomaly", 1)
          .where("gensetPropertyId", stat.gensetPropertyId)
          .where("timestamp", ">=", currentMonthStart.toSQL({ includeOffset: true }))
          .count("* as count");

        return {
          propertyName: stat.gensetProperty.propertyName,
          readablePropertyName: stat.gensetProperty.readablePropertyName,
          counts: {
            today: Number(todayCount[0]?.$extras.count) || 0,
            week: Number(weekCount[0]?.$extras.count) || 0,
            month: Number(monthCount[0]?.$extras.count) || 0,
            total: Number(totalCount[0]?.$extras.count) || 0,
          },
        };
      })
    );

    // Get overall counts
    const totalCount = await Archive.query() //
      .where("isAnomaly", true)
      .count("* as count");

    const todayTotal = await Archive.query()
      .where("isAnomaly", 1)
      .where("timestamp", ">=", todayStart.toSQL({ includeOffset: true }))
      .count("* as count");

    const weekTotal = await Archive.query()
      .where("isAnomaly", 1)
      .where("timestamp", ">=", currentWeekStart.toSQL({ includeOffset: true }))
      .count("* as count");

    const monthTotal = await Archive.query()
      .where("isAnomaly", 1)
      .where("timestamp", ">=", currentMonthStart.toSQL({ includeOffset: true }))
      .count("* as count");

    return {
      timezone, // Include timezone in response for clarity
      overall: {
        today: Number(todayTotal[0]?.$extras.count) || 0,
        week: Number(weekTotal[0]?.$extras.count) || 0,
        month: Number(monthTotal[0]?.$extras.count) || 0,
        total: Number(totalCount[0]?.$extras.count) || 0,
      },
      byProperty: propertyStatsByTime,
    };
  }
  async delete({ response }: HttpContext) {
    response.status(400).send({ message: "Not Implemented" });
  }

  async deleteAll({}: HttpContext) {
    const notifications = await Notification.query().delete();
    const archive = await Archive.query().delete();
    return archive;
  }
}
