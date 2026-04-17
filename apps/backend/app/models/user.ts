import { DateTime } from "luxon";
import hash from "@adonisjs/core/services/hash";
import { compose } from "@adonisjs/core/helpers";
import { BaseModel, column, belongsTo, beforeCreate, hasMany } from "@adonisjs/lucid/orm";
import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import Role from "#models/role";
import ApiToken from "#models/api_token";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import { randomUUID, type UUID } from "node:crypto";

const AuthFinder = withAuthFinder(() => hash.use("scrypt"), { uids: ["email"], passwordColumnName: "password" });

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: UUID;

  @column()
  declare firstName: string | null;

  @column()
  declare lastName: string | null;

  @column()
  declare email: string;

  @column({ serializeAs: null })
  declare password: string;

  @column()
  declare roleId: string;

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>;

  @column()
  declare isActive: boolean; // for soft deletion

  @hasMany(() => ApiToken)
  declare authTokens: HasMany<typeof ApiToken>;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime;

  @beforeCreate()
  static assignUuid(user: User) {
    user.id = randomUUID();
  }
}