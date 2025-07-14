import { DateTime } from "luxon";
import { BaseModel, beforeCreate, column } from "@adonisjs/lucid/orm";
import { type UUID } from "node:crypto";

export default class NotificationType extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID;

  @column()
  declare type: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Assign a UUID to the NotificationType instance before creation.
   * @param notificationType NotificationType
   */
  @beforeCreate()
  static assignUuid(notificationType: NotificationType) {
    notificationType.id = crypto.randomUUID();
  }
}
