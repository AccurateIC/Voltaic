import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "sensor_properties";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("property_name");
      table.string("unit");

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}

