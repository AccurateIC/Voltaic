import User from "#models/user";
import { BaseModel, beforeCreate, column, hasMany } from "@adonisjs/lucid/orm";
import type { HasMany } from "@adonisjs/lucid/types/relations";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";

export default class Role extends BaseModel {
  static selfAssignPrimaryKey = true;

  @column({ isPrimary: true })
  declare id: string;

  @column()
  declare roleName: string;

  @hasMany(() => User)
  declare users: HasMany<typeof User>;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @beforeCreate()
  static assignUuid(role: Role) {
    role.id = randomUUID();
  }
}
