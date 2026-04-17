import { DateTime, type WeekNumbers, type DayNumbers, type MonthNumbers } from "luxon";
import { BaseModel, beforeCreate, beforeSave, column } from "@adonisjs/lucid/orm";
import { type UUID } from "node:crypto";
import logger from "@adonisjs/core/services/logger";
interface MaintenanceReason {
  accel_x?: string;
  accel_y?: string;
  accel_z?: string;
}

export default class MaintenanceNotification extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID;

  @column.dateTime()
  declare timestamp: DateTime;

  @column()
  declare day: DayNumbers;

  @column()
  declare week: WeekNumbers;

  @column()
  declare month: MonthNumbers;

  @column()
  declare year: number;

  @column()
  declare maintenanceReason: MaintenanceReason;

  @column()
  declare predictedDominantFrequency: number;

  @column()
  declare predictedDominantAmplitude: number;

  @column({ columnName: 'should_be_displayed' })
  declare shouldBeDisplayed: boolean;

  @column.dateTime({ columnName: 'resolved_at' })
  declare resolvedAt: DateTime | null;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Assigns a UUID to the MaintenanceNotification instance before creation.
   * @param maintenanceNotification MaintenanceNotification
   */
  @beforeCreate()
  static assignUuid(maintenanceNotification: MaintenanceNotification) {
    maintenanceNotification.id = crypto.randomUUID();
  }

  /**
   * Automatically set day, week, month, and year from timestamp
   */
  @beforeSave()
  static setTimeComponents(maintenanceNotification: MaintenanceNotification) {
    logger.info(
  { maintenanceNotification },
  "Setting time components for maintenance notification"
);
    if (maintenanceNotification.timestamp) {
      const ts = maintenanceNotification.timestamp;
      maintenanceNotification.day = ts.day as DayNumbers;
      maintenanceNotification.week = ts.weekNumber as WeekNumbers;
      maintenanceNotification.month = ts.month as MonthNumbers;
      maintenanceNotification.year = ts.year;
    }
  }
}
