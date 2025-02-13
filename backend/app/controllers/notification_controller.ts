import Notification from "#models/notification";
import { createNotificationValidator } from "#validators/notification";
import type { HttpContext } from "@adonisjs/core/http";

export default class NotificationController {
  async getAll({}: HttpContext) {
    return await Notification.query().preload("notificationType");
  }

  // mark a notification as `read`
  async read({ params }: HttpContext) {
    const notification = await Notification.findOrFail(params.id);
    notification.shouldBeDisplayed = false;
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
