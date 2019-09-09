import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { TokenGuard } from './guards/token';
import { BindUserMiddleware } from './middlewares/bindUser';
import { TokenService } from './services/token';

@Module({
  providers: [TokenService, TokenGuard],
  exports: [TokenService, TokenGuard]
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(BindUserMiddleware).forRoutes('*');
  }
}
