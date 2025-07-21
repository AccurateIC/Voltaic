import { DateTime } from "luxon";
import { BaseModel, beforeCreate, belongsTo, column } from "@adonisjs/lucid/orm";
import PhysicalQuantity from "#models/physical_quantity";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { type UUID } from "node:crypto";

export default class GensetProperty extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID;

  @column()
  declare propertyName: string;

  @column()
  declare readablePropertyName: string;

  @column()
  declare physicalQuantityId: UUID;

  @belongsTo(() => PhysicalQuantity)
  declare physicalQuantity: BelongsTo<typeof PhysicalQuantity>;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Assigns a UUID to the GensetProperty instance before creation.
   * @param gensetProperty GensetProperty
   */
  @beforeCreate()
  static assignUuid(gensetProperty: GensetProperty) {
    gensetProperty.id = crypto.randomUUID();
  }
}
