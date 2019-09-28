import { CanActivate, createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TokenGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return !!request.user;
  }
}

export const CurrentUser = createParamDecorator((data, request: any) => {
  return request.user;
});
