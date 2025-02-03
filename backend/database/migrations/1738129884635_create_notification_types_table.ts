import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "notification_types";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      table.string("type").notNullable().unique();

      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
