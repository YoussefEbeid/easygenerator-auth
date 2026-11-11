import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import { toPublicUser } from '../users/user.mapper';
import { UsersService } from '../users/users.service';
import { COOKIE_NAME } from './auth.constants';
import { AuthResult, AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './strategies/jwt.strategy';

const STRICT_LIMIT = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Post('signup')
  @Throttle(STRICT_LIMIT)
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respondWithSession(res, await this.auth.signUp(dto));
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT_LIMIT)
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.respondWithSession(res, await this.auth.signIn(dto));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, this.cookieOptions());
    return { message: 'Signed out' };
  }

  @Get('me')
  @ApiCookieAuth(COOKIE_NAME)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() current: AuthenticatedUser) {
    const user = await this.users.findById(current.userId);
    if (!user) throw new UnauthorizedException();
    return toPublicUser(user);
  }

  private respondWithSession(res: Response, { accessToken, user }: AuthResult) {
    res.cookie(COOKIE_NAME, accessToken, {
      ...this.cookieOptions(),
      maxAge: this.sessionSeconds() * 1000,
    });
    return user;
  }

  private sessionSeconds(): number {
    const raw = this.config.get<string | number>(
      'JWT_EXPIRES_IN_SECONDS',
      3600,
    );
    const seconds = Number(raw);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 3600;
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/',
    };
  }
}
