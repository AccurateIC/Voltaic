// app/controllers/notification_type/update_controller.ts

import NotificationType from "#models/notification_type";
import type { HttpContext } from "@adonisjs/core/http";
import { createNotificationTypeValidator } from "#validators/notification_type";

export default class UpdateController {
  /**
   * update a type of notification
   */
  async update({ params, request, response }: HttpContext) {
    const updatedTypeData = await request.validateUsing(createNotificationTypeValidator);
    const notificationType = await NotificationType.findOrFail(params.id);
    notificationType.type = updatedTypeData.type;
    await notificationType.save();
  }
}
