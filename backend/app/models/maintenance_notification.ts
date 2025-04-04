import { DateTime } from "luxon";
import { BaseModel, column } from "@adonisjs/lucid/orm";

interface MaintenanceReason {
  accel_x?: string;
  accel_y?: string;
  accel_z?: string;
}

export default class MaintenanceNotification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare timestamp: DateTime;

  @column()
  declare maintenanceReason: MaintenanceReason;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
