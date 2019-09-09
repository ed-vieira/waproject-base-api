import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ICurrentUser } from 'interfaces/tokens/currentUser';

import { CurrentUser, TokenGuard } from '../guards/token';
import { AuthService } from '../services/auth';
import { LoginValidator } from '../validators/auth/login';
import { LogoutValidator } from '../validators/auth/logout';
import { OpenedValidator } from '../validators/auth/opened';
import { RefreshValidator } from '../validators/auth/refresh';

@Controller('/auth')
export class AuthController {
  constructor(private readonly appService: AuthService) {}

  @Post('login')
  public async login(@Body() model: LoginValidator) {
    return this.appService.login(model);
  }

  @Post('logout')
  @UseGuards(TokenGuard)
  public async logout(@Body() model: LogoutValidator, @CurrentUser() currentUser: ICurrentUser) {
    await this.appService.logout(currentUser, model.deviceId);
    return { success: true };
  }

  @Post('refresh')
  public async refresh(@Body() model: RefreshValidator) {
    return {
      accessToken: await this.appService.refreshToken(model.refreshToken, model.deviceId),
      refreshToken: model.refreshToken
    };
  }

  @Post('opened')
  @UseGuards(TokenGuard)
  public async opened(@Body() model: OpenedValidator, @CurrentUser() currentUser: ICurrentUser) {
    await this.appService.updateSession(currentUser.client.id, model.deviceId, model.notificationToken);
    return { success: true };
  }
}
