import { IUserSocial } from 'interfaces/models/userSocial';
import { Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';

import { User } from './user';

@Entity({ name: 'UserSocial' })
export class UserSocial implements IUserSocial {
  @PrimaryColumn({ nullable: false, type: 'integer' })
  public userId: number;
  @PrimaryColumn({ nullable: false, length: 50 })
  public provider: string;

  @PrimaryColumn({ nullable: false, length: 150 })
  public ref: string;

  @OneToMany(() => User, user => user.socials)
  @JoinColumn({ name: 'userId' })
  public user: User;
}
