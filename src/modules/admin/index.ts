import { HttpModule, Module } from '@nestjs/common';
import { CommonModule } from 'modules/common/module';
import { DatabaseModule } from 'modules/database/module';

import { AuthController } from './controllers/auth';
import { UserController } from './controllers/user';
import { UserRepository } from './repositories/user';
import { AuthService } from './services/auth';

@Module({
  imports: [HttpModule, CommonModule, DatabaseModule],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserRepository]
})
export class AppModule {}
