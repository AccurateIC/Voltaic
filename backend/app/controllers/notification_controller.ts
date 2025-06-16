import Notification from "#models/notification";
import { createNotificationValidator } from "#validators/notification";
import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";

export default class NotificationController {
  async getAll({}: HttpContext) {
    return await Notification.query()
      .preload("notificationType")
      .preload("archive", (query) => query.preload("gensetProperty", (query) => query.preload("physicalQuantity")))
      .orderBy("id", "desc");
    // const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
  }

  // getResolved
  async getResolved({}: HttpContext) {
    return await Notification.query()
      .where("shouldBeDisplayed", false)
      .preload("notificationType")
      .preload("archive", (query) => query.preload("gensetProperty", (query) => query.preload("physicalQuantity")));
    // const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
  }

  // getUnresolved
  async getUnresolved({}: HttpContext) {
    return await Notification.query()
      .where("shouldBeDisplayed", true)
      .preload("notificationType")
      .preload("archive", (query) => query.preload("gensetProperty", (query) => query.preload("physicalQuantity")));
    // const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
  }

  // mark a notification as `read`
  async read({ params }: HttpContext) {
    const notification = await Notification.findOrFail(params.id);
    notification.shouldBeDisplayed = false;
    notification.finishedAt = DateTime.now();
    await notification.save();
    return notification;
  }

  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createNotificationValidator);
    const createdNotification = await Notification.create({
      ...data,
      startedAt: DateTime.fromJSDate(data.startedAt),
      finishedAt: data.finishedAt ? DateTime.fromJSDate(data.finishedAt) : null,
    });
    return createdNotification;
  }

  async update({ response }: HttpContext) {
    return response.status(400).send({ message: "Not Implemented" });
  }
}
