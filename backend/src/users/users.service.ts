import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

interface NewUser {
  email: string;
  name: string;
  passwordHash: string;
}

const DUPLICATE_KEY_CODE = 11000;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<User>) {}

  async create(data: NewUser): Promise<UserDocument> {
    try {
      return await this.model.create(data);
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_CODE) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).exec();
  }

  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).select('+passwordHash').exec();
  }
}
