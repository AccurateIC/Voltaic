import { BaseSeeder } from "@adonisjs/lucid/seeders";
import NotificationType from "#models/notification_type";

export default class extends BaseSeeder {
  async run() {
    await NotificationType.createMany([
      //
      { type: "info" },
      { type: "warning" },
      { type: "alert" },
    ]);
  }
}
