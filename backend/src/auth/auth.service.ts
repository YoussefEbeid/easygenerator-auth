import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserDocument } from '../users/schemas/user.schema';
import { PublicUser, toPublicUser } from '../users/user.mapper';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthResult> {
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.users.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    this.logger.log(`New account created: ${user.id}`);

    return this.issueToken(user);
  }

  async signIn(dto: SignInDto): Promise<AuthResult> {
    const user = await this.users.findByEmailWithPassword(dto.email);
    const passwordMatches = user
      ? await argon2.verify(user.passwordHash, dto.password)
      : false;

    // Same message for "no such user" and "wrong password" on purpose
    if (!user || !passwordMatches) {
      this.logger.warn('Failed sign-in attempt');
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user);
  }

  private async issueToken(user: UserDocument): Promise<AuthResult> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id as string,
      email: user.email,
    });
    return { accessToken, user: toPublicUser(user) };
  }
}
