import { DateTime, type WeekNumbers, type DayNumbers, type MonthNumbers } from "luxon";
import { BaseModel, beforeSave, column } from "@adonisjs/lucid/orm";

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

  @column()
  declare shouldBeDisplayed: boolean;

  @column()
  declare resolvedAt: DateTime;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Automatically set day, week, month, and year from timestamp
   */
  @beforeSave()
  static setTimeComponents(maintenanceNotification: MaintenanceNotification) {
    console.log("TSSS", maintenanceNotification);
    if (maintenanceNotification.timestamp) {
      const ts = maintenanceNotification.timestamp;
      maintenanceNotification.day = ts.day as DayNumbers;
      maintenanceNotification.week = ts.weekNumber as WeekNumbers;
      maintenanceNotification.month = ts.month as MonthNumbers;
      maintenanceNotification.year = ts.year;
    }
  }
}
