import { DateTime } from "luxon";
import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import PhysicalQuantity from "#models/physical_quantity";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

// id (primary key)	propertyName	quantityId	createdAt	updatedAt

export default class GensetProperty extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare propertyName: string;

  @column()
  declare quantityId: number;

  @belongsTo(() => PhysicalQuantity)
  declare role: BelongsTo<typeof PhysicalQuantity>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
