import { BadRequestException } from '@nestjs/common';
import { IChurch } from 'interfaces/models/church';
import { enRoles, IChurchUser } from 'interfaces/models/churchUser';
import { IUser } from 'interfaces/models/user';

import { enTokenType, TokenService } from './token';

describe('Admin/TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    service = new TokenService();
  });

  const church: IChurch = {
    id: 1,
    name: 'ICB Sorocaba 1',
    email: null,
    slug: 'icb-sorocaba',
    phone: '111111',
    address: 'R. Cesário Mota, 217 - Centro, Sorocaba - SP, 18035-200, Brasil',
    latitude: -23.5028451,
    longitude: -47.46187259999999
  };

  const user: IUser = {
    id: 1,
    email: 'test@email.com',
    firstName: 'test',
    lastName: 'test'
  };

  const churchUser: IChurchUser = {
    userId: user.id,
    churchId: church.id,
    roles: [enRoles.admin],
    church
  };

  it('should generate an accessToken for web', async () => {
    return service
      .generateAccessToken(user, churchUser, false)
      .then(token => {
        expect(typeof token).toBe('string');
        return service.verify(token, enTokenType.accessToken);
      })
      .then(result => {
        expect(result.id).toEqual(user.id);
        expect(result.firstName).toEqual(user.firstName);
        expect(result.lastName).toEqual(user.lastName);
        expect(result.email).toEqual(user.email);
        expect(result.roles).toEqual(churchUser.roles);
        expect(result.church.id).toEqual(churchUser.church.id);
        expect(result.church.name).toEqual(churchUser.church.name);
        expect(result.church.slug).toEqual(churchUser.church.slug);
      });
  });

  it('should generate an accessToken for app', async () => {
    return service
      .generateAccessToken(user, churchUser, true)
      .then(token => {
        expect(typeof token).toBe('string');
        return service.verify(token, enTokenType.accessToken);
      })
      .then(result => {
        expect(result.id).toEqual(user.id);
        expect(result.firstName).toEqual(user.firstName);
        expect(result.lastName).toEqual(user.lastName);
        expect(result.email).toEqual(user.email);
        expect(result.roles).toEqual(churchUser.roles);
        expect(result.church.id).toEqual(churchUser.church.id);
        expect(result.church.name).toEqual(churchUser.church.name);
        expect(result.church.slug).toEqual(churchUser.church.slug);
      });
  });

  it('should verify method reject when send an invalid accessToken', () => {
    return service
      .verify('invalid', enTokenType.accessToken)
      .then(() => fail())
      .catch(err => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message.message).toEqual('token-invalid');
      });
  });

  it('should verify method reject when type is different', () => {
    return service
      .generateAccessToken(user, churchUser)
      .then(token => {
        expect(token).toBeString();
        return service.verify(token, enTokenType.refreshToken);
      })
      .then(() => fail())
      .catch(err => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message.message).toEqual('token-type-not-match');
      });
  });
});
