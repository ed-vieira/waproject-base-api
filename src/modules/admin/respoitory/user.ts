import { Injectable } from '@nestjs/common';
import { User } from 'modules/database/models/user';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {}
