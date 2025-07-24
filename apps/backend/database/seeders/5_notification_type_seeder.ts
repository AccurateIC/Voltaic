import { BaseSeeder } from "@adonisjs/lucid/seeders";
import NotificationType from "#models/notification_type";
import { randomUUID } from "node:crypto";

export default class extends BaseSeeder {
  async run() {
    await NotificationType.createMany([
      //
      { id: randomUUID(), type: "info" },
      { id: randomUUID(), type: "warning" },
      { id: randomUUID(), type: "alert" },
    ]);
  }
}
