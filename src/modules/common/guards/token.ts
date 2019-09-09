import { CanActivate, createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable()
export class TokenGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest<any>>();
    return !!request.req.user;
  }
}

export const CurrentUser = createParamDecorator((data, request: FastifyRequest<any>) => {
  return request.req.user;
});
