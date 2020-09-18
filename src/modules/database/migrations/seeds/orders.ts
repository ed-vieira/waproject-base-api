import * as Knex from 'knex';
import * as faker from 'faker/locale/pt_BR';
import { IOrder } from 'modules/database/interfaces/order';
import { IS_DEV } from 'settings';

export async function seed(knex: Knex): Promise<any> {
  if (!IS_DEV) return;
  for (let i = 0; i < 30; i++) {
    const order: IOrder = {
      description: faker.lorem.words(10),
      value: faker.random.number({ min: 10, max: 10000 }),
      quantity: faker.random.number({ min: 1, max: 100 }),
      createdDate: new Date(),
      updatedDate: new Date()
    };

    await knex.insert(order).into('Orders');
  }
}
