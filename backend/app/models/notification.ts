import { DateTime } from "luxon";
import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import Archive from "#models/archive";
import NotificationType from "#models/notification_type";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare summary: string;

  @column()
  declare message: string;

  @column()
  declare archiveId: number; // references archive.id

  @belongsTo(() => Archive)
  declare archive: BelongsTo<typeof Archive>;

  @column()
  declare shouldBeDisplayed: boolean;

  @column()
  declare notificationTypeId: number; // references notification_type.id

  @belongsTo(() => NotificationType)
  declare notificationType: BelongsTo<typeof NotificationType>;

  @column()
  declare startedAt: DateTime;

  @column()
  declare finishedAt: DateTime;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
