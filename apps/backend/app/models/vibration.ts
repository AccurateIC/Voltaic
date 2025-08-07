import { DateTime } from "luxon";
import { BaseModel, beforeCreate, belongsTo, column } from "@adonisjs/lucid/orm";
import SensorProperty from "./sensor_property.js";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import MaintenanceNotification from "./maintenance_notification.js";
import PdmDataKind from "./pdm_data_kind.js";
import { type UUID } from "node:crypto";

export default class Vibration extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID;

  @column()
  declare timestamp: DateTime;

  @column()
  declare sensorPropertyId: UUID;

  @belongsTo(() => SensorProperty)
  declare sensorProperty: BelongsTo<typeof SensorProperty>;

  @column()
  declare value: number;

  @column()
  declare confidenceScorePercentage: number;

  @column()
  declare maintenanceNotificationId?: UUID;

  @belongsTo(() => MaintenanceNotification)
  declare maintenanceNotification: BelongsTo<typeof MaintenanceNotification>;

  @column()
  declare pdmDataKindId: UUID;

  @belongsTo(() => PdmDataKind)
  declare pdmDataKind: BelongsTo<typeof PdmDataKind>;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Assigns a UUID to the Vibration instance before creation.
   * @param vibration Vibration
   */
  @beforeCreate()
  static assignUuid(vibration: Vibration) {
    vibration.id = crypto.randomUUID();
  }
}
