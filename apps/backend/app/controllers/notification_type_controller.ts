import type { HttpContext } from "@adonisjs/core/http";
import NotificationType from "#models/notification_type";
import { createNotificationTypeValidator } from "#validators/notification_type";
import logger from "@adonisjs/core/services/logger";
export default class NotificationTypeController {
  async getAll({}: HttpContext) {
    const allNotificationTypes = await NotificationType.all();
  logger.info({ allNotificationTypes }, "Fetched all notification types");
    return allNotificationTypes;
  }

  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createNotificationTypeValidator);
    const newNotificationType = await NotificationType.create(data);
   logger.info(
  { isPersisted: newNotificationType.$isPersisted },
  "Notification type created"
);
    return newNotificationType.serialize();
  }

  async update({ params, request }: HttpContext) {
    // params.id
    const data = await request.validateUsing(createNotificationTypeValidator);
    // find existing notification type by id
    const notificationType = await NotificationType.findOrFail(params.id);
    notificationType.type = data.type; // update the type
    await notificationType.save();
   logger.info(
  { isPersisted: notificationType.$isPersisted },
  "Notification type updated"
);
    return notificationType.serialize();
  }

  async delete({ params }: HttpContext) {
    const notificationType = await NotificationType.findOrFail(params.id);
    await notificationType.delete();
  }
}
