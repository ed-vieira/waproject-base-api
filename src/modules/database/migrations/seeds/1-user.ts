import { enRoles, IUser } from 'interfaces/models/user';
import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const adminUser: IUser = {
    firstName: 'WaProject',
    lastName: 'Admin',
    email: 'admin@waproject.com.br',
    password: '$2y$12$tb8iGhF4eUEuLY1h4zSe5OTr8C1.3L8ZRFV0yP5eQdu8iYaufInfe', //senha@123
    roles: enRoles.sysAdmin as any,
    createdDate: new Date(),
    updatedDate: new Date()
  };

  const users = await knex
    .count()
    .from('User')
    .where({ email: adminUser.email })
    .first();

  if (Number(users.count) > 0) return;

  await knex.insert(adminUser).into('User');
}
