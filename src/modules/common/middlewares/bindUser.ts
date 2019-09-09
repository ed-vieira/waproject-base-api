import { Injectable, NestMiddleware } from '@nestjs/common';

import { enTokenType, TokenService } from '../services/token';

@Injectable()
export class BindUserMiddleware implements NestMiddleware {
  constructor(private tokenService: TokenService) {}

  public async use(req: any, res: Response, next: Function) {
    const request = req;
    const accessToken = (request.headers.authorization || '').split(' ')[1];

    if (!accessToken) {
      return next();
    }

    try {
      req.user = await this.tokenService.verify(accessToken, enTokenType.accessToken);
    } catch (err) {}

    next();
  }
}
