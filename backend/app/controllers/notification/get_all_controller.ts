// app/controllers/notification/get_all_controller.ts

import type { HttpContext } from "@adonisjs/core/http";
import Notification from "#models/notification";

export default class GetAllController {
  /**
   * get all unread notifications
   */
  async index({}: HttpContext) {
    const allNotificationTypes = await Notification.all();
    console.log(allNotificationTypes);
    return allNotificationTypes;
  }
}
