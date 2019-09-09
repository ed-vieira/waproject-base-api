import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE_DB, DATABASE_HOST, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USER } from 'settings';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      username: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_DB,
      synchronize: false,
      logging: false,
      entities: [`${__dirname}/models/**/*.ts`],
      migrations: [`${__dirname}/migrations/**/*.ts`],
      subscribers: [`${__dirname}/subscribers/**/*.ts`]
    })
  ],
  exports: []
})
export class DatabaseModule {}
