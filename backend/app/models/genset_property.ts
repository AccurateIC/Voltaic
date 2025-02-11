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
  declare physicalQuantityId: number;

  @belongsTo(() => PhysicalQuantity)
  declare physicalQuantity: BelongsTo<typeof PhysicalQuantity>;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;
}
