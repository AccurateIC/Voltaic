// app/controller/notification_type/create_controller.ts

import NotificationType from "#models/notification_type";
import type { HttpContext } from "@adonisjs/core/http";
import { createNotificationTypeValidator } from "#validators/notification_type";

export default class CreateController {
  /**
   * create a type of notification
   */
  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createNotificationTypeValidator);
    const newNotificationType = await NotificationType.create(data);
    console.log(newNotificationType.$isPersisted);
    return newNotificationType.serialize();
  }
}
