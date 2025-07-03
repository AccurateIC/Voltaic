import { DateTime } from "luxon";
import { BaseModel, column } from "@adonisjs/lucid/orm";
import { type UUID } from "node:crypto";

export default class SensorProperty extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID;

  @column()
  declare propertyName: string;

  @column()
  declare unit: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;
}
