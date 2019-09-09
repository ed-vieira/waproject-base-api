import { BadRequestException, Injectable } from '@nestjs/common';
import { IChurchUser } from 'interfaces/models/churchUser';
import { IUser } from 'interfaces/models/user';
import { ICurrentUser } from 'interfaces/tokens/currentUser';
import { IRefreshToken } from 'interfaces/tokens/refreshToken';
import * as jwt from 'jsonwebtoken';
import { AUTH } from 'settings';
import uuid from 'uuid/v4';

export enum enTokenType {
  accessToken = 0,
  resetPassword = 1,
  refreshToken = 2
}

@Injectable()
export class TokenService {
  public async generateAccessToken(user: IUser, churchUser: IChurchUser, forApp: boolean = false): Promise<string> {
    const tokenData: ICurrentUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: churchUser.roles ? churchUser.roles : [],
      church: {
        id: churchUser.church.id,
        name: churchUser.church.name,
        slug: churchUser.church.slug
      }
    };

    return this.sign(tokenData, enTokenType.accessToken, forApp ? AUTH.appTimeout : AUTH.timeout);
  }

  public async generateRefreshToken(userId: number, deviceId: string, application: string): Promise<string> {
    const tokenData: IRefreshToken = { userId, deviceId, application, uuid: uuid() };
    return this.sign(tokenData, enTokenType.refreshToken);
  }

  public async verify(token: string, type: enTokenType.refreshToken): Promise<IRefreshToken>;
  public async verify(token: string, type: enTokenType.accessToken): Promise<ICurrentUser>;
  public async verify<T>(token: string, type: enTokenType): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      jwt.verify(token, AUTH.secret, (err: any, decoded: any) => {
        if (err || !decoded || decoded.type !== type) {
          return reject(this.resolveVerifyError(err));
        }

        resolve(decoded);
      });
    });
  }

  private async sign(tokenData: any, type: enTokenType, expiration: number = null): Promise<string> {
    return new Promise<string>(resolve => {
      (<any>tokenData).type = type;

      if (expiration) {
        (<any>tokenData).exp = this.expirationDate(expiration);
      }

      resolve(jwt.sign(tokenData, AUTH.secret));
    });
  }

  private expirationDate(minutes: number): number {
    return Math.floor(Date.now() / 1000) + minutes * 60;
  }

  private resolveVerifyError(err: Error): Error {
    if (!err) {
      return new BadRequestException('token-type-not-match');
    }

    switch (err.name) {
      case 'TokenExpiredError':
        return new BadRequestException('token-expired');
      default:
        return new BadRequestException('token-invalid');
    }
  }
}
