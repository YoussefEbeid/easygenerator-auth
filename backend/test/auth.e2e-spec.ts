import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import type { Connection } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e, real MongoDB)', () => {
  let app: INestApplication;
  let server: App;
  let connection: Connection;

  // Throwaway fixture for the test database, not a real credential
  const credentials = {
    email: `e2e-${Date.now()}@example.com`,
    name: 'Jane Tester',
    password: 'hunter2025!', // NOSONAR
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    server = app.getHttpServer() as App;
    connection = app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection
      .collection('users')
      .deleteMany({ email: credentials.email });
    await app.close();
  });

  it('signs up, sets an httpOnly cookie and never returns the password', async () => {
    const res = await request(server)
      .post('/api/auth/signup')
      .send(credentials)
      .expect(201);

    const body = res.body as Record<string, unknown>;
    expect(body.email).toBe(credentials.email);
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('passwordHash');

    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies[0]).toContain('access_token=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('stores a hash, not the plain password', async () => {
    const stored = (await connection
      .collection('users')
      .findOne({ email: credentials.email })) as {
      passwordHash?: string;
    } | null;

    expect(stored?.passwordHash).toMatch(/^\$argon2/);
  });

  it('returns 409 for a duplicate email', async () => {
    await request(server)
      .post('/api/auth/signup')
      .send(credentials)
      .expect(409);
  });

  it('rejects a weak password with 400', async () => {
    await request(server)
      .post('/api/auth/signup')
      .send({ ...credentials, email: 'weak@example.com', password: 'abc' })
      .expect(400);
  });

  it('signs in and reaches the protected endpoint with the cookie', async () => {
    const agent = request.agent(server);

    await agent
      .post('/api/auth/signin')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    const me = await agent.get('/api/auth/me').expect(200);
    expect((me.body as { email: string }).email).toBe(credentials.email);
  });

  it('rejects a wrong password with the generic message', async () => {
    const res = await request(server)
      .post('/api/auth/signin')
      .send({ email: credentials.email, password: 'wrong-pass-1!' })
      .expect(401);

    expect((res.body as { message: string }).message).toBe(
      'Invalid email or password',
    );
  });

  it('blocks the protected endpoint without a cookie', async () => {
    await request(server).get('/api/auth/me').expect(401);
  });
});
