import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "archives";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(["timestamp"], "archives_timestamp_index");
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(["timestamp"], "archives_timestamp_index");
    });
  }
}
