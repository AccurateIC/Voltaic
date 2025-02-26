import Notification from "#models/notification";
import { createNotificationValidator } from "#validators/notification";
import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";

export default class NotificationController {
  async getAll({}: HttpContext) {
    return await Notification.query()
      .preload("notificationType")
      .preload("archive", (query) => query.preload("gensetProperty", (query) => query.preload("physicalQuantity")));
    // const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
  }

  // mark a notification as `read`
  async read({ params }: HttpContext) {
    console.log(params.id);
    const notification = await Notification.findOrFail(params.id);
    notification.shouldBeDisplayed = false;
    notification.finishedAt = DateTime.now().toMillis();
    await notification.save();
    return notification;
  }

  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createNotificationValidator);
    const createdNotification = await Notification.create(data);
    return createdNotification;
  }

  async update({ response }: HttpContext) {
    return response.status(400).send({ message: "Not Implemented" });
  }
}
