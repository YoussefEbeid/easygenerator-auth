# Auth Module

Sign up, sign in and a protected page. NestJS and MongoDB on the back end, React and TypeScript on the front end.

## Stack

- **API:** NestJS 11, Mongoose, Passport JWT, argon2, Helmet, Throttler, Swagger
- **Web:** React 19, Vite, React Router, React Hook Form, Zod
- **Database:** MongoDB (local via Docker, or MongoDB Atlas)
- **Tooling:** Jest, Supertest, Vitest, ESLint, GitHub Actions

## Project structure

```
backend/    NestJS API (auth and users modules, e2e tests in test/)
frontend/   React app (pages, components, auth feature, API client)
```

## Getting started

Requires Node 20+ and Docker (or an Atlas cluster).

**1. Database**

```bash
docker compose up -d
```

To use Atlas instead, set `MONGODB_URI` in `backend/.env` to your connection string and allow your IP under Network Access.

**2. API**

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

**3. Web app**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```


Vite proxies `/api` to the API, so the browser sees a single origin and the session cookie works without extra CORS setup.

## Environment variables

| Variable                 | Description                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`            | Connection string for the app database                                                              |
| `MONGODB_TEST_URI`       | Separate database used by the e2e tests                                                             |
| `JWT_SECRET`             | Signing key, at least 32 characters                                                                 |
| `JWT_EXPIRES_IN_SECONDS` | Session length, default 3600                                                                        |
| `CORS_ORIGIN`            | Allowed front-end origin                                                                            |
| `DNS_SERVERS`            | Optional. Comma-separated DNS servers, for networks that block SRV lookups used by `mongodb+srv://` |

## Endpoints

| Method | Path               | Auth | Description                           |
| ------ | ------------------ | ---- | ------------------------------------- |
| POST   | `/api/auth/signup` | No   | Create an account and start a session |
| POST   | `/api/auth/signin` | No   | Sign in and start a session           |
| POST   | `/api/auth/logout` | No   | Clear the session cookie              |
| GET    | `/api/auth/me`     | Yes  | Current user (protected endpoint)     |

## Validation rules

- **Email:** valid format
- **Name:** at least 3 characters
- **Password:** at least 8 characters, with a letter, a number and a special character

The same rules run in the browser (Zod) and on the server (class-validator).

## Security

- JWT stored in an httpOnly, SameSite=Lax cookie (Secure in production)
- Passwords hashed with argon2; the hash is excluded from queries by default
- Helmet headers, restricted CORS, rate limiting (5 requests per minute on sign in and sign up)
- Request bodies are whitelisted and unknown fields are rejected
- Sign-in errors are identical for unknown emails and wrong passwords
- Secrets live in `backend/.env`, which is gitignored

## Scripts

| Where    | Command             | Description                                           |
| -------- | ------------------- | ----------------------------------------------------- |
| backend  | `npm run start:dev` | API with reload                                       |
| backend  | `npm test`          | e2e tests against a real MongoDB (`MONGODB_TEST_URI`) |
| backend  | `npm run lint`      | ESLint                                                |
| backend  | `npm run build`     | Production build                                      |
| frontend | `npm run dev`       | Dev server                                            |
| frontend | `npm test`          | Validation unit tests                                 |
| frontend | `npm run build`     | Production build                                      |

## Deployment

Serve the built front end and the API behind one domain (reverse proxy `/api` to Nest) so the cookie stays first-party. Set `NODE_ENV=production`, a strong `JWT_SECRET` and `CORS_ORIGIN` to the site URL. If you use Atlas, add the server IP to Network Access.

## Known limitations

- No refresh tokens; sessions last `JWT_EXPIRES_IN_SECONDS`
- No email verification or password reset
- No dummy hash on unknown emails, so response timing could reveal whether an account exists
- No browser-level end-to-end tests
