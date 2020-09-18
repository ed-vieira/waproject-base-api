import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Orders', table => {
    table.increments('id').primary();
    table.string('description', 300).notNullable();
    table.decimal('value', 9, 2).notNullable();
    table.integer('quantity').notNullable();
    table.dateTime('createdDate').nullable();
    table.dateTime('updatedDate').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('Orders');
}
