import type { HttpContext } from "@adonisjs/core/http";
import NotificationType from "#models/notification_type";
import { createNotificationTypeValidator } from "#validators/notification_type";

export default class NotificationTypeController {
  async getAll({ request, response }: HttpContext) {
    const allNotificationTypes = await NotificationType.all();
    console.log(allNotificationTypes);
    return allNotificationTypes;
  }

  async create({ request, response }: HttpContext) {
    const data = await request.validateUsing(createNotificationTypeValidator);
    const newNotificationType = await NotificationType.create(data);
    console.log(newNotificationType.$isPersisted);
    return newNotificationType.serialize();
  }

  async update({ params, request }: HttpContext) {
    // params.id
    const data = await request.validateUsing(createNotificationTypeValidator);
    // find existing notification type by id
    const notificationType = await NotificationType.findOrFail(params.id);
    notificationType.type = data.type; // update the type
    await notificationType.save();
    console.log(notificationType.$isPersisted);
    return notificationType.serialize();
  }

  async delete({ params }: HttpContext) {
    const notificationType = await NotificationType.findOrFail(params.id);
    await notificationType.delete();
  }
}
