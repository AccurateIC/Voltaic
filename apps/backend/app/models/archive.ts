// backend/app/models/archive.ts
import { DateTime, type DayNumbers, type MonthNumbers, type WeekNumbers } from "luxon";
import { BaseModel, belongsTo, column, beforeSave } from "@adonisjs/lucid/orm";
import GensetProperty from "#models/genset_property";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Archive extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare timestamp: DateTime; // day, month, week, year => grpBy day, month, year

  @column()
  declare day: DayNumbers;

  @column()
  declare week: WeekNumbers;

  @column()
  declare month: MonthNumbers;

  @column()
  declare year: number;

  @column()
  declare gensetPropertyId: number; //

  @belongsTo(() => GensetProperty)
  declare gensetProperty: BelongsTo<typeof GensetProperty>;

  @column()
  declare propertyValue: number;

  @column()
  declare isAnomaly: boolean;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Automatically set day, week, month, and year from timestamp
   */
  @beforeSave()
  static setTimeComponents(archive: Archive) {
    if (archive.timestamp) {
      const ts = archive.timestamp;
      archive.day = ts.day as DayNumbers;
      archive.week = ts.weekNumber as WeekNumbers;
      archive.month = ts.month as MonthNumbers;
      archive.year = ts.year;
    }
  }
}
