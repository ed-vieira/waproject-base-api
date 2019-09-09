import ContactCenter from '@eduzz/contact-center';
import ContactCenterPush from '@eduzz/contact-center/internals/Push';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import mockingoose from 'mockingoose';
import mongoose, { Model } from 'mongoose';
import { IUserSession, UserSessionSchema, UserSessionToken } from 'schemas/userSession';

import { ApiService } from './api';
import { AuthService } from './auth';
import { TokenService } from './token';

describe('Admin/AuthService', () => {
  let service: AuthService;
  let apiService: ApiService;
  let tokenService: TokenService;
  let contactCenter: ContactCenter;
  let contactCenterPush: ContactCenterPush;
  let userSessionModel: Model<IUserSession>;

  beforeEach(async () => {
    tokenService = new TokenService();
    apiService = new ApiService(null);
    contactCenter = new ContactCenter('mock', null);
    contactCenterPush = new ContactCenterPush('mock', null);
    userSessionModel = mongoose.model(UserSessionToken, UserSessionSchema);

    service = new AuthService(userSessionModel, apiService, tokenService, contactCenter);
  });

  afterEach(() => {
    mockingoose(userSessionModel).reset();
  });

  it('should return a valid accessToken and refreshToken', async () => {
    jest.spyOn(apiService, 'myEduzz').mockResolvedValue({ id: 1, email: 'test@test.com', apikey: 'apikey' });
    jest.spyOn(apiService, 'myEduzzApi2').mockResolvedValue({ token: 'access_token' });

    mockingoose(userSessionModel).toReturn({ _id: 1 });

    jest.spyOn(tokenService, 'accessToken').mockResolvedValue('app_access_token');
    jest.spyOn(tokenService, 'refreshToken').mockResolvedValue('app_refresh_token');
    jest.spyOn(contactCenterPush, 'registerDevice').mockResolvedValue(null);
    jest.spyOn(contactCenter, 'Push', 'get').mockReturnValue(contactCenterPush);

    const result = await service.login({
      email: 'teste',
      password: '123',
      deviceId: '1',
      deviceName: 'test device',
      deviceType: 'jest',
      notificationToken: 'token'
    });

    expect(result).not.toBeFalsy();
    expect(result.accessToken).toEqual('app_access_token');
    expect(result.refreshToken).toEqual('app_refresh_token');
  });

  it('should throw BadRequestException when myEduzz response invalid', async () => {
    jest.spyOn(apiService, 'myEduzz').mockRejectedValue({ response: 'response' });

    return service
      .login({
        email: 'teste',
        password: '123',
        deviceId: '1',
        deviceName: 'test device',
        deviceType: 'jest',
        notificationToken: 'token'
      })
      .then(() => fail())
      .catch(err => expect(err).toBeInstanceOf(BadRequestException));
  });

  it('should rethrow same error when myEduzz response invalid', async () => {
    const error = new Error('test');
    jest.spyOn(apiService, 'myEduzz').mockRejectedValue(error);

    return service
      .login({
        email: 'teste',
        password: '123',
        deviceId: '1',
        deviceName: 'test device',
        deviceType: 'jest',
        notificationToken: 'token'
      })
      .then(() => fail())
      .catch(err => expect(err).toBe(error));
  });

  it('should throw BadRequestException when myEduzzApi2 response invalid', async () => {
    jest.spyOn(apiService, 'myEduzz').mockResolvedValue({ id: 1, email: 'test@test.com', apikey: 'apikey' });
    jest.spyOn(apiService, 'myEduzzApi2').mockRejectedValue({ response: 'response' });

    return service
      .login({
        email: 'teste',
        password: '123',
        deviceId: '1',
        deviceName: 'test device',
        deviceType: 'jest',
        notificationToken: 'token'
      })
      .then(() => fail())
      .catch(err => expect(err).toBeInstanceOf(BadRequestException));
  });

  it('should rethrow same error when myEduzzApi2 response invalid', async () => {
    const error = new Error('test');
    jest.spyOn(apiService, 'myEduzz').mockResolvedValue({ id: 1, email: 'test@test.com', apikey: 'apikey' });
    jest.spyOn(apiService, 'myEduzzApi2').mockRejectedValue(error);

    return service
      .login({
        email: 'teste',
        password: '123',
        deviceId: '1',
        deviceName: 'test device',
        deviceType: 'jest',
        notificationToken: 'token'
      })
      .then(() => fail())
      .catch(err => expect(err).toBe(error));
  });

  it('should return a valid accessToken from a refreshToken', async () => {
    jest.spyOn(tokenService, 'verify').mockResolvedValue({
      id: 1,
      deviceId: '1',
      client: { id: 1, email: 'test@test.com', apikey: 'apikey' }
    } as any);
    jest.spyOn(tokenService, 'refreshToken').mockResolvedValue('app_refresh_token');
    jest.spyOn(apiService, 'myEduzzApi2').mockResolvedValue({ token: 'access_token' });
    jest.spyOn(tokenService, 'accessToken').mockResolvedValue('app_access_token');

    mockingoose(userSessionModel).toReturn({ _id: 1 }, 'findOne');

    const result = await service.refreshToken('app_refresh_token', '1');
    expect(result).toEqual('app_access_token');
  });

  it('should throw BadRequestException when deviceId didn`t match', async () => {
    jest.spyOn(tokenService, 'verify').mockResolvedValue({
      id: 1,
      deviceId: '1',
      client: { id: 1, email: 'test@test.com', apikey: 'apikey' }
    } as any);

    return service
      .refreshToken('app_refresh_token', '2')
      .then(() => fail())
      .catch(err => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message.message).toEqual('invalid-device');
      });
  });

  it('should throw NotFoundException when session was not found', async () => {
    jest.spyOn(tokenService, 'verify').mockResolvedValue({
      id: 1,
      deviceId: '1',
      client: { id: 1, email: 'test@test.com', apikey: 'apikey' }
    } as any);

    mockingoose(userSessionModel).toReturn(null, 'findOne');

    return service
      .refreshToken('app_refresh_token', '1')
      .then(() => fail())
      .catch(err => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message.message).toEqual('session-not-found');
      });
  });

  it('should delete a session', async () => {
    mockingoose(userSessionModel).toReturn(null, 'deleteOne');
    jest.spyOn(contactCenterPush, 'removeEduzzIdFromDevice').mockResolvedValue(null);
    jest.spyOn(contactCenter, 'Push', 'get').mockReturnValue(contactCenterPush);

    return expect(service.logout(1, '1')).toResolve();
  });

  it('should update a session', async () => {
    mockingoose(userSessionModel).toReturn(null, 'update');
    mockingoose(userSessionModel).toReturn({ deviceName: 'device' }, 'findOne');
    jest.spyOn(contactCenterPush, 'registerDevice').mockResolvedValue(null);
    jest.spyOn(contactCenter, 'Push', 'get').mockReturnValue(contactCenterPush);

    return expect(service.updateSession(1, '1', 'notificationToken')).toResolve();
  });

  it('should throw NotFoundException when session was not found during the update session', async () => {
    mockingoose(userSessionModel).toReturn(null, 'findOne');
    return service
      .updateSession(1, '1', 'notificationToken')
      .then(() => fail())
      .catch(err => {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message.message).toEqual('session-not-found');
      });
  });
});
