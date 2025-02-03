import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'physical_quantities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('quantity_name').notNullable().unique()
      table.string('unit_name').notNullable()
      table.string('unit_symbol').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
