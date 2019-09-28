import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ICurrentUser } from 'interfaces/tokens/currentUser';
import { CurrentUser, TokenGuard } from 'modules/common/guards/token';

import { AuthService } from '../services/auth';
import { ChangePasswordValidator } from '../validators/auth/changePassword';
import { LoginValidator } from '../validators/auth/login';
import { ResetPasswordValidator } from '../validators/auth/resetPassword';
import { SendResetValidator } from '../validators/auth/sendReset';

@Controller('/auth')
export class AuthController {
  constructor(private readonly appService: AuthService) {}

  @Post('login')
  public async login(@Body() model: LoginValidator) {
    return this.appService.login(model.email, model.password);
  }

  @Post('send-reset')
  public async sendReset(@Body() model: SendResetValidator) {
    return this.appService.sendResetPassword(model.email);
  }

  @Post('reset-password')
  public async resetPassword(@Body() model: ResetPasswordValidator) {
    return this.appService.resetPassword(model.token, model.password);
  }

  @Post('change-password')
  @UseGuards(TokenGuard)
  public async changePassword(@Body() model: ChangePasswordValidator, @CurrentUser() currentUser: ICurrentUser) {
    return this.appService.changePassword(currentUser, model.currentPassword, model.newPassword);
  }
}
