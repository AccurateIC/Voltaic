import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "archives";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      table.timestamp("timestamp").notNullable();

      table
        .integer("genset_property_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("genset_properties")
        .onDelete("RESTRICT");

      table.double("property_value", 5).notNullable();

      table.boolean("is_anomaly").notNullable();

      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
