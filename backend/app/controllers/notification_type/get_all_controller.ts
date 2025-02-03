// app/controller/notification_type/get_all_controller.ts

import NotificationType from "#models/notification_type";
import type { HttpContext } from "@adonisjs/core/http";

export default class GetAllController {
  /**
   * get all notification types
   */
  async index({}: HttpContext) {
    console.log("hit");
    const allNotificationTypes = await NotificationType.all();
    console.log(allNotificationTypes);
    return allNotificationTypes;
  }
}
