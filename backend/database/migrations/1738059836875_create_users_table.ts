import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "users";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      // personal info
      table.string("first_name").nullable();
      table.string("last_name").nullable();
      table.string("email").notNullable().unique();

      // auth
      table.string("password").notNullable();

      // relationships
      table.integer("role_id").unsigned().notNullable().references("id").inTable("roles").onDelete("RESTRICT");

      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
