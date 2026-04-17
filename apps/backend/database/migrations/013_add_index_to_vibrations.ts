import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "vibrations";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(["timestamp"], "vibrations_timestamp_index");
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(["timestamp"], "vibrations_timestamp_index");
    });
  }
}
