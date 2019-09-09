import ContactCenter from '@eduzz/contact-center';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { IAccessToken } from 'interfaces/tokens';
import { Model } from 'mongoose';
import { IUserSession, UserSessionToken } from 'schemas/userSession';
import { MYEDUZZ_ENDPOINT_TOKEN } from 'settings';
import sha1 from 'sha1';

import { LoginValidator } from '../validators/auth/login';
import { ApiService } from './api';
import { enTokenType, TokenService } from './token';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserSessionToken) private userSession: Model<IUserSession>,
    private apiService: ApiService,
    private tokenService: TokenService,
    private contactCenter: ContactCenter
  ) {}

  public async login(model: LoginValidator) {
    const client = await this.loginMyEduzzApi(model.email, model.password, model.deviceType);
    const token = await this.loginApi2(client);

    const userSession = await this.userSession.create({
      eduzzId: client.id,
      lastSession: new Date(),
      deviceId: model.deviceId,
      deviceName: model.deviceName
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.accessToken({ client, accessToken: token }),
      this.tokenService.refreshToken(userSession._id, model.deviceId, client),
      this.contactCenter.Push.registerDevice({
        provider: 'firebase',
        deviceId: model.deviceId,
        deviceName: model.deviceName,
        notificationToken: model.notificationToken,
        eduzzId: client.id
      })
    ]);

    await userSession.save();

    return { accessToken, refreshToken };
  }

  public async logout(eduzzId: number, deviceId: string) {
    await Promise.all([
      this.userSession.deleteOne({ eduzzId, deviceId }),
      this.contactCenter.Push.removeEduzzIdFromDevice(eduzzId, deviceId)
    ]);
  }

  public async refreshToken(refreshToken: string, deviceId: string) {
    const tokenData = await this.tokenService.verify(refreshToken, enTokenType.refreshToken);

    if (tokenData.deviceId !== deviceId) {
      throw new BadRequestException('invalid-device');
    }

    const userSession = await this.userSession.findById(tokenData.id);

    if (!userSession) {
      throw new NotFoundException('session-not-found');
    }

    const accessToken = await this.loginApi2(tokenData.client);
    return this.tokenService.accessToken({ client: tokenData.client, accessToken });
  }

  public async updateSession(eduzzId: number, deviceId: string, notificationToken: string) {
    const device = await this.userSession.findOne({ deviceId });

    if (!device) {
      throw new NotFoundException('session-not-found');
    }

    await Promise.all([
      this.userSession.updateOne({ eduzzId, deviceId }, { lastSession: new Date() }),
      this.contactCenter.Push.registerDevice({
        provider: 'firebase',
        deviceId,
        eduzzId,
        notificationToken,
        deviceName: device.deviceName
      })
    ]);
  }

  private async loginMyEduzzApi(email: string, password: string, deviceType: string) {
    const client = await this.apiService
      .myEduzz<{ id: number; email: string; apikey: string }>({
        url: '/loginapp',
        method: 'GET',
        params: {
          EMAIL: email,
          PASSWORD: sha1(`${sha1(password)}app2sales`),
          TOKEN: MYEDUZZ_ENDPOINT_TOKEN,
          DEVICE_TYPE: deviceType
        }
      })
      .catch((err: AxiosError) => {
        if (!err.response) throw err;
        throw new BadRequestException('invalid-credentials');
      });

    return { id: client.id, email: client.email, apikey: client.apikey };
  }

  private async loginApi2(client: IAccessToken['client']) {
    const { token } = await this.apiService
      .myEduzzApi2<{ token: string }>({
        url: '/credential/generate_token',
        method: 'POST',
        data: {
          publickey: client.id.toString(),
          email: client.email,
          apikey: client.apikey
        }
      })
      .catch((err: AxiosError) => {
        if (!err.response) throw err;
        throw new BadRequestException('invalid-credentials');
      });

    return token;
  }
}
