import { enRoles, IUser } from 'interfaces/models/user';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserDevice } from './userDevice';
import { UserSocial } from './userSocial';

@Entity({ name: 'User' })
export class User implements IUser {
  @PrimaryGeneratedColumn({ type: 'integer' })
  public id: number;

  @Column({ nullable: false, length: 50 })
  public firstName: string;

  @Column({ nullable: true, length: 50 })
  public lastName: string;

  @Column({ nullable: true, length: 150, unique: true })
  public email: string;

  @Column({ nullable: true, length: 100 })
  public password: string;

  @Column({ type: 'simple-array', nullable: false })
  public roles: enRoles[];

  @CreateDateColumn()
  public createdDate: Date;

  @UpdateDateColumn()
  public updatedDate: Date;

  @OneToMany(() => UserDevice, userDevice => userDevice.user)
  public devices?: UserDevice[];

  @OneToMany(() => UserSocial, userSocial => userSocial.user)
  public socials?: UserSocial[];

  public isSysAdmin(): boolean {
    return this.roles.includes(enRoles.sysAdmin);
  }
}
