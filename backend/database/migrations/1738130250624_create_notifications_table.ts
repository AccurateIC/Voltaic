import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "notifications";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      table.string("summary").notNullable();
      table.string("message").nullable();

      table.integer("archive_id").unsigned().notNullable().references("id").inTable("archives").onDelete("RESTRICT");

      table.boolean("should_be_displayed").notNullable();

      table
        .integer("notification_type_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("notification_types")
        .onDelete("RESTRICT");

      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
