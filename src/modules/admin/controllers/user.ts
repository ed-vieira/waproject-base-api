import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { IAccessToken } from 'interfaces/tokens';
import { MYEDUZZ_CDN } from 'settings';

import { CurrentUser, TokenGuard } from '../guards/token';
import { UserRepository } from '../repositories/user';

@Controller('/user')
@UseGuards(TokenGuard)
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get()
  public async getProfile(@CurrentUser() currentUser: IAccessToken) {
    const user = await this.userRepository.getProfile(currentUser.client.id);

    if (!user) throw new NotFoundException();

    user.photo = user.photo ? `${MYEDUZZ_CDN}/${user.photo}` : null;
    return user;
  }
}
