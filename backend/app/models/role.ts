import { DateTime } from "luxon";
import { BaseModel, column, hasMany } from "@adonisjs/lucid/orm";
import User from "#models/user";
import type { HasMany } from "@adonisjs/lucid/types/relations";

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare roleName: string;

  @hasMany(() => User)
  declare users: HasMany<typeof User>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;
}
