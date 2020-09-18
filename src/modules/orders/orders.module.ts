import { HttpModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommonModule } from 'modules/common/module';
import { DatabaseModule } from 'modules/database/module';

import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { OrderRepository } from './repositories/order';
import { RenewTokenMiddleware } from './middlewares/renewToken';

@Module({
  imports: [HttpModule, CommonModule, DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository]
})
export class OrdersModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(RenewTokenMiddleware).forRoutes('*');
  }
}
