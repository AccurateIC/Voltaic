import { DateTime } from "luxon";
import { BaseModel, beforeCreate, column } from "@adonisjs/lucid/orm";
import { randomUUID, type UUID } from "node:crypto";

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

  @beforeCreate()
  static assignUuid(sensorProperty: SensorProperty) {
    sensorProperty.id = randomUUID();
  }
}
