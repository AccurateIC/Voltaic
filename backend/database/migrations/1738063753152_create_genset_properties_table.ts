import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "genset_properties";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      table.string("property_name").notNullable().unique();
      table.integer("physical_quantity_id").unsigned().references("physical_quantities.id").onDelete("RESTRICT");

      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").notNullable();
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
