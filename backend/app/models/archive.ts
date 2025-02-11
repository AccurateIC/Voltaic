import { DateTime } from "luxon";
import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import GensetProperty from "#models/genset_property";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Archive extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare timestamp: DateTime; // unix epoch?

  @column()
  declare gensetPropertyId: number; //

  @belongsTo(() => GensetProperty)
  declare gensetProperty: BelongsTo<typeof GensetProperty>;

  @column()
  declare propertyValue: number;

  @column()
  declare isAnomaly: boolean;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
