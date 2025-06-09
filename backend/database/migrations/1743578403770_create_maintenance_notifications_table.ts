import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "maintenance_notifications";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.timestamp("timestamp").notNullable();
      table.integer("day").notNullable();
      table.integer("week").notNullable();
      table.integer("month").notNullable();
      table.integer("year").notNullable();

      table.json("maintenance_reason");
      table.boolean("should_be_displayed").notNullable();
      table.timestamp("resolved_at");

      table.decimal("predicted_dominant_frequency");
      table.decimal("predicted_dominant_amplitude");

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
