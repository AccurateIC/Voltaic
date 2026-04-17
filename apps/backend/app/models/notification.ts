import { DateTime } from "luxon";
import { BaseModel, beforeCreate, belongsTo, column } from "@adonisjs/lucid/orm";
import Archive from "#models/archive";
import NotificationType from "#models/notification_type";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { type UUID } from "node:crypto";

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID;

  @column()
  declare summary: string;

  @column()
  declare message: string;

  @column()
  declare archiveId: UUID; // references archive.id

  @belongsTo(() => Archive)
  declare archive: BelongsTo<typeof Archive>;

  @column({ columnName: 'should_be_displayed' })
  declare shouldBeDisplayed: boolean;

  @column()
  declare notificationTypeId: UUID; // references notification_type.id

  @belongsTo(() => NotificationType)
  declare notificationType: BelongsTo<typeof NotificationType>;

  @column.dateTime({ columnName: 'started_at' })
  declare startedAt: DateTime;

  @column.dateTime({ columnName: 'finished_at' })
  declare finishedAt: DateTime | null;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Assign a UUID to the Notification instance before creation.
   * @param notification Notification
   */
  @beforeCreate()
  static assignUuid(notification: Notification) {
    notification.id = crypto.randomUUID();
  }
}
