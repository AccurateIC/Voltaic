import { DateTime } from "luxon";
import { BaseModel, beforeCreate, column } from "@adonisjs/lucid/orm";
import { type UUID } from "node:crypto";

export default class PdmDataKind extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID;

  @column()
  declare kind: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  /**
   * Assigns a UUID to the PdmDataKind instance before creation.
   * @param pdmDataKind PdmDataKind
   */
  @beforeCreate()
  static assignUuid(pdmDataKind: PdmDataKind) {
    pdmDataKind.id = crypto.randomUUID();
  }
}
