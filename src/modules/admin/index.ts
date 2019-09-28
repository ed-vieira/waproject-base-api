import { HttpModule, Module } from '@nestjs/common';
import { CommonModule } from 'modules/common/module';
import { DatabaseModule } from 'modules/database/module';

import { AuthController } from './controllers/auth';
import { UserRepository } from './respoitories/user';
import { AuthService } from './services/auth';

@Module({
  imports: [HttpModule, CommonModule, DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, UserRepository]
})
export class AppModule {}
