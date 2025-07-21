import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "vibrations";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary();
      table.timestamp("timestamp").notNullable();
      table //
        .uuid("sensor_property_id")
        .notNullable()
        .references("id")
        .inTable("sensor_properties")
        .onDelete("RESTRICT");
      table.float("value");
      table.decimal("confidence_score_percentage");
      table
        .uuid("maintenance_notification_id")
        .notNullable()
        .references("id")
        .inTable("maintenance_notifications")
        .onDelete("RESTRICT");
      table //
        .uuid("pdm_data_kind_id")
        .notNullable()
        .references("id")
        .inTable("pdm_data_kinds")
        .onDelete("RESTRICT");

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
