import { DateTime } from "luxon";
import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class PhysicalQuantity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare quantityName: string;

  @column()
  declare unitName: string;

  @column()
  declare unitSymbol: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;
}
