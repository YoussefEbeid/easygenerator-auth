# AI Usage

## Tools

- **Claude**: planning the architecture, code review, and debugging.

I used AI to move fast on scaffolding and validation logic also I reviewed every file, ran it and fixed what broke. The decisions at the end of this file are mine.

## What I generated with AI

- Project and folder structure (NestJS `users` and `auth` modules, React `api`, `components`, `features`, `pages`)
- DTO validation with class-validator and the matching Zod schemas
- Mongoose schema, JWT cookie strategy, auth controller and service
- CI workflow, Docker Compose for MongoDB, base CSS

## What I adapted or rewrote

- **Tests.** The first version unit-tested the auth service with a mocked user service. I replaced it with e2e tests against a real MongoDB and a separate test database.
- **DTO transforms.** The inline `@Transform` callbacks failed lint (`any`). I moved them to typed `trimString` and `normalizeEmail` helpers.
- **React auth context.** I split the context and `useAuth` into `auth-context.ts` so the provider file exports only a component, and replaced `watch()` with `useWatch`.
- **Database connection.** I added an optional `DNS_SERVERS` override after Node failed to resolve the Atlas SRV record.

## Prompts that worked well

- **The full task text plus constraints.** I pasted the whole assignment and added: production-ready, professional folder structure, React not Vue, and the terminal command for every step. The first output was close to the final layout.
- **The exact error, not a description.** I pasted the first lines of the terminal output or a screenshot of the Problems panel. This produced precise fixes, such as the `import type` change.
- **One concern per prompt.** "Typed DTO transforms that pass lint" worked better than "fix all lint errors".
- **A requirements check.** I asked whether the protected endpoint, README and ORM requirements were covered, then verified each against the task text.

## Where the output needed fixing

| `TS1272` build error in the auth controller | With `isolatedModules` and decorator metadata, types in decorated signatures must be type-only imports | `import type` |
| ESLint "unsafe any" in DTOs and the user mapper | Inline transforms returned `any`, and Mongoose types `id` as `any` | Typed helpers and a single cast |
| "Property has no initializer" | `strictPropertyInitialization` conflicts with class-transformer and Mongoose, which fill fields after construction | Disabled that one flag |
| Jest globals not found in the e2e file | The editor auto-imported `describe` from `node:test` | Removed the import and kept `types: ["node", "jest"]` |
| CI workflow invalid (15 errors) | One job key was indented 4 spaces instead of 2 | Fixed the indentation |
| `querySrv ECONNREFUSED` to Atlas | `nslookup` resolved the SRV record, but Node's resolver through my router was refused | `DNS_SERVERS` override, or local MongoDB via Docker |
| React lint warnings | `watch()` cannot be memoized, and a hook exported next to a component breaks fast refresh | `useWatch` and a separate context file |

## Decisions I made differently from the AI's suggestion

- **No mocks in tests.** The AI's first version mocked the database. I required a real MongoDB, because production runs on it. The test setup throws if `MONGODB_TEST_URI` is missing, so tests can never touch the app database.
- **No `npm audit fix --force`.** The 28 reported vulnerabilities are almost all dev-only transitive packages, and forcing the fix can break the Nest tooling. I checked production dependencies separately with `npm audit --omit=dev`.
- **Credentials.** I rotated the Atlas password after it was exposed during debugging, and kept all secrets in a gitignored `.env`.

## Design decisions

- **httpOnly cookie instead of localStorage**, so scripts cannot read the token.
- **argon2 over bcrypt** for password hashing.
- **Mongoose** through `@nestjs/mongoose`, the standard fit for NestJS and MongoDB.
- **Generic sign-in error** ("Invalid email or password") so the API does not reveal which emails exist.
- **Vite proxy** so the browser sees a single origin and the cookie works without extra CORS setup.
- **Known gap:** no dummy hash on unknown emails, so response timing could reveal whether an account exists. Listed in the README.

## How I verified it

- Backend e2e tests against a real MongoDB: sign up, duplicate email (409), weak password (400), sign in, protected endpoint with and without the cookie, generic error message
- Frontend schema tests, lint and production builds on both sides
