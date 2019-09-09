import { IUserDevice } from 'interfaces/models/userDevice';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { User } from './user';

@Entity({ name: 'UserDevice' })
export class UserDevice implements IUserDevice {
  @PrimaryColumn({ nullable: false, length: 150 })
  public deviceId: string;

  @PrimaryColumn({ nullable: false, type: 'integer' })
  public userId: number;

  @Column({ nullable: false, length: 150 })
  public name: string;

  @Column({ nullable: false, type: 'uuid' })
  public currentToken: string;

  @Column({ nullable: true, length: 250 })
  public notificationToken?: string;

  @ManyToOne(() => User, user => user.devices)
  @JoinColumn({ name: 'userId' })
  public user: User;
}
