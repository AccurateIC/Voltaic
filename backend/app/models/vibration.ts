import { DateTime } from "luxon";
import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import SensorProperty from "./sensor_property.js";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import MaintenanceNotification from "./maintenance_notification.js";
import PdmDataKind from "./pdm_data_kind.js";

export default class Vibration extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare timestamp: DateTime;

  @column()
  declare sensorPropertyId: number;

  @belongsTo(() => SensorProperty)
  declare sensorProperty: BelongsTo<typeof SensorProperty>;

  @column()
  declare value: number;

  @column()
  declare confidenceScorePercentage: number;

  @column()
  declare maintenanceNotificationId: number;

  @belongsTo(() => MaintenanceNotification)
  declare maintenanceNotification: BelongsTo<typeof MaintenanceNotification>;

  @column()
  declare pdmDataKindId: number;

  @belongsTo(() => PdmDataKind)
  declare pdmDataKind: BelongsTo<typeof PdmDataKind>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
