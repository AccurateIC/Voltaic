import { createArchiveValidator, getArchiveDataBetweenValidator } from "#validators/archive";
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

  async getLatest({}: HttpContext) {
    const latestArchiveEntry = await Archive.query().orderBy("timestamp", "desc").limit(1);
    const latestTimestamp = latestArchiveEntry[0].timestamp;
    const latestArchiveData = await Archive.query()
      .where("timestamp", latestTimestamp)
      .preload("gensetProperty", (query) => query.preload("physicalQuantity"));

    return latestArchiveData;
  }

  // async create({ request }: HttpContext) {
  //   const payload = await request.validateUsing(createArchiveValidator);
  //   // const timestamp = DateTime.fromISO(payload.timestamp.toISOString()).toUTC().set({ millisecond: 0 });
  //   const timestamp = payload.timestamp;
  //   const data = payload.data;
  //   const archiveData = [];
  //   const notificationData = [];

  //   // apparently normal for loop is considered "bug-prone" xD
  //   // see: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-for-loop.md
  //   for (const [index, element] of data.entries()) {
  //     console.log(index, element);
  //     const gensetProperty = await GensetProperty.findByOrFail("propertyName", `${element.property}`);
  //     archiveData.push({
  //       timestamp: timestamp,
  //       gensetPropertyId: gensetProperty.id,
  //       propertyValue: element.value,
  //       isAnomaly: element.is_anomaly,
  //     });
  //     // TODO: create notification here based on the `is_anomaly` field & save them to notifications table
  //   }
  //   await Archive.createMany(archiveData);

  //   // const insertedArchiveData = await Archive.findManyBy("timestamp", timestamp);
  //   const insertedArchiveData = await Archive.query().where("timestamp", timestamp).preload("gensetProperty");

  //   for (const [index, element] of insertedArchiveData.entries()) {
  //     if (element.isAnomaly) {
  //       console.log(element.isAnomaly);
  //       // fetch existing notification data
  //       const notificationDataFromDb = await Notification.findManyBy("finished_at", null);
  //       // current property being considered
  //       const currentProperty = element.gensetProperty.propertyName;

  //       // loop over all notifications where finished_at is null
  //       // and find if any notification co-relates to the current genset property being evaluated
  //       for (const [index, notification] of notificationDataFromDb.entries()) {
  //         // related archive id:
  //         console.log(notification.archiveId);
  //         // fetch details about that archive entry
  //         const relatedArchiveData = await Archive.query().where("id", notification.archiveId).preload("gensetProperty"); // TODO: see if we can fetch just one element instead of an array
  //         // check if current property being considered matches any existing notification
  //         if (relatedArchiveData[0].gensetProperty.propertyName === currentProperty) {
  //           // if an ongoing notification exists for the give propertyName
  //           // then do nothing
  //           continue;
  //         } else {
  //           // this means that no such notification exists in the notification table where property being considered matches
  //           // && finished at is null
  //           // this means that new notification has started for propertyName
  //           // hence a new entry has to be created in the notifications table
  //           Notification.create({
  //             summary: `Anomaly detected for ${element.gensetProperty.propertyName}`,
  //             message: `Property value ${element.propertyValue} is anomalous`,
  //             archiveId: element.id,
  //             shouldBeDisplayed: true,
  //             notificationTypeId: 3, // 1 = info, 2 = warning, 3 = alert
  //             startedAt: timestamp,
  //             finishedAt: null,
  //           });
  //         }
  //       }
  //       // check if prev element related to the archive_id exists
  //     } else {
  //       // if the current archive entry is not an anomaly, check if the it has any history in the notification table
  //       const notificationDataFromDb = await Notification.findManyBy("finished_at", null);
  //       const currentProperty = element.gensetProperty.propertyName;
  //       for (const [index, notification] of notificationDataFromDb.entries()) {
  //         console.log(notification.archiveId);
  //         const relatedArchiveData = await Archive.query().where("id", notification.archiveId).preload("gensetProperty"); // TODO: see if we can fetch just one element instead of an array
  //         if (relatedArchiveData[0].gensetProperty.propertyName === currentProperty) {
  //           // up until this entry, the property was anomalous
  //           // but now the anomaly has ended and property is now normal
  //           // thus notification has ended => `finished_at` should be updated
  //           const notif = await Notification.findOrFail(notification.id);
  //           notif.finishedAt = timestamp;
  //           await notif.save();
  //         } else {
  //           // if no notification for the property exists where finished at is null,
  //           // it means that either all prev notifications for this property have been completed
  //           // or it means that the property was never anomalous up until this point in time
  //           //
  //           // in any case, we do not have to do any thing?
  //         }
  //       }
  //     }
  //   }

  //   // create a server sent event to notify frontend that new telemetry data has been inserted into the database
  //   // the event is broadcasted to the `channel` denoted by the first parameter
  //   transmit.broadcast("archive", { message: "new entry created" });

  //   return data;
  // }

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
        // console.log("inserted archives", insertedArchives);
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

        // console.log("active notifications", activeNotifications);

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
        // Log the error for debugging
        console.error("Transaction failed:", error);
        throw error; // Re-throw to trigger rollback
      }
    });
  }

  async delete({ response }: HttpContext) {
    response.status(400).send({ message: "Not Implemented" });
  }
}
