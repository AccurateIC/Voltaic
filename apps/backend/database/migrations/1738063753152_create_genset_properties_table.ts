import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "genset_properties";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary();

      table.string("property_name").notNullable().unique();
      table.string("readable_property_name").notNullable().unique();

      // relationships
      table
        .uuid("physical_quantity_id")
        .notNullable()
        .references("id")
        .inTable("physical_quantities")
        .onDelete("RESTRICT");

      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
