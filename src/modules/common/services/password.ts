import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt-nodejs';
import generatePassword from 'password-generator';
import { BCRYPT_SALT_FACTOR } from 'settings';

@Injectable()
export class PasswordService {
  public async hash(password: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(BCRYPT_SALT_FACTOR, (err: any, salt: string) => {
        if (err) return reject(err);

        bcrypt.hash(password, salt, null, (err: any, hash: string) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });
    });
  }

  public async compare(hash: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err: any, isMatch: boolean) => {
        if (err || !isMatch) return reject(false);
        resolve(true);
      });
    });
  }

  public async generatePassword(): Promise<{ password: string; hash: string }> {
    const password = generatePassword(6);
    const hash = await this.hash(password);

    return { password, hash };
  }
}
