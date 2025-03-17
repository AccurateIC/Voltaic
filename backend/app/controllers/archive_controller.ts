import { DateTime } from "luxon";
import { createArchiveValidator, getArchiveDataBetweenValidator, getPaginatedDataValidator } from "#validators/archive";
import Archive from "#models/archive";
import GensetProperty from "#models/genset_property";
import type { HttpContext } from "@adonisjs/core/http";
import transmit from "@adonisjs/transmit/services/main";
import Notification from "#models/notification";
import db from "@adonisjs/lucid/services/db";

export default class ArchiveController {
  async getAll({}: HttpContext) {
    const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
    return archiveData;
  }

  async getPaginated({ request }: HttpContext) {
    const requestData = await request.validateUsing(getPaginatedDataValidator);

    // start building the select query
    const archiveQuery = Archive.query();

    // FILTERING

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

    // pagination
    const archiveData = await archiveQuery.paginate(requestData.page);

    return archiveData;
  }

  async getBetween({ request }: HttpContext) {
    const queryParams = request.qs();
    const data = await getArchiveDataBetweenValidator.validate(queryParams);

    const archiveData = await Archive.query()
      .whereBetween("timestamp", [data.from, data.to])
      .preload("gensetProperty", (query) => query.preload("physicalQuantity"));
    return archiveData;
  }

  async getLatest({}: HttpContext) {
    const latestArchiveEntry = await Archive.query().orderBy("timestamp", "desc").limit(1);
    const latestTimestamp = latestArchiveEntry[0].timestamp;
    const latestArchiveData = await Archive.query()
      .where("timestamp", latestTimestamp)
      .preload("gensetProperty", (query) => query.preload("physicalQuantity"));

    return latestArchiveData;
  }

  async getPropertyDataBetween({ request, response }: HttpContext) {
    try {
      const { startDate, endDate } = request.qs();

      // Validate input
      if (!startDate || !endDate) {
        return response.status(400).send({ message: "startDate and endDate are required." });
      }

      // Convert strings to DateTime
      const from = DateTime.fromISO(startDate, { zone: "utc" });
      const to = DateTime.fromISO(endDate, { zone: "utc" });

      // Validate date conversion
      if (!from.isValid || !to.isValid) {
        return response.status(400).send({ message: "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ssZ)." });
      }

      // Query database for records within date range
      const archiveData = await Archive.query()
        .whereBetween("timestamp", [from.toSQL(), to.toSQL()])
        .preload("gensetProperty", (query) => query.preload("physicalQuantity"));

      return archiveData;
    } catch (error) {
      console.error("Error in getPropertyDataBetween:", error);
      return response.status(500).send({ message: "Internal Server Error" });
    }
  }

  async create({ request }: HttpContext) {
    const payload = await request.validateUsing(createArchiveValidator);
    const timestamp = payload.timestamp;
    const data = payload.data;

    // begin sqlite transaction
    return await db.transaction(async (trx) => {
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

        // Broadcast event
        transmit.broadcast("archive", {
          message: "new entry created",
        });

        const activeNotifications = await Notification.query({ client: trx })
          .whereNull("finishedAt")
          .preload("archive", (query) => {
            query.preload("gensetProperty");
          })
          .exec();

        // process notifications
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

          if (archive.isAnomaly) {
            if (!activeNotification) {
              newNotifications.push({
                summary: `Anomaly detected for ${property.propertyName}`,
                message: `Property value ${archive.propertyValue} is anomalous`,
                archiveId: archive.id,
                shouldBeDisplayed: true,
                notificationTypeId: 3,
                startedAt: timestamp,
                finishedAt: null,
              });
            }
          } else if (activeNotification) {
            notificationUpdates.push({
              id: activeNotification.id,
              finishedAt: timestamp,
            });
          }
        }

        // bulk create new notifications and update existing ones
        if (newNotifications.length > 0) {
          await Notification.createMany(newNotifications, { client: trx });
          transmit.broadcast("notification", {
            message: "notification table updated",
          });
        }

        for (const update of notificationUpdates) {
          await Notification.query({ client: trx })
            .where("id", update.id)
            .update({ finishedAt: update.finishedAt, shouldBeDisplayed: false });
          transmit.broadcast("notification", {
            message: "notification table updated",
          });
        }

        return insertedArchives;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error; 
    });
  }

  async delete({ response }: HttpContext) {
    response.status(400).send({ message: "Not Implemented" });
  }
}
