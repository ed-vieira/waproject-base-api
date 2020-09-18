import { Module } from '@nestjs/common';
import { RouterModule } from 'nest-router';

import { AdminModule } from './admin/module';
import { AppModule } from './app/module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    RouterModule.forRoutes([
      { path: '/admin', module: AdminModule },
      { path: '/app', module: AppModule },
      { path: '/admin/orders', module: OrdersModule }
    ]),
    AdminModule,
    AppModule,
    OrdersModule
  ]
})
export class ApplicationModule {}
