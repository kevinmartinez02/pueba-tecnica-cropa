# Daymark

Task management practice project. The web app uses Next.js, and the API uses NestJS, TypeORM, and SQLite.

## Requirements

- Node.js 26
- pnpm 11

## Setup

```bash
pnpm install
pnpm --filter api migration:run
pnpm --filter api seed:demo-users
```

Create `apps/web/.env.local` from `apps/web/.env.example` if the API does not use `http://localhost:8000`.

Run the API and web app in separate terminals:

```bash
pnpm --filter api dev
```

```bash
pnpm --filter web dev
```

The web app runs at `http://localhost:3000`; the API runs at `http://localhost:8000`. Swagger is available at `http://localhost:8000/api`.

## Demo login

Both demo accounts use the password `Demo1234`:

| Username | Password |
| --- | --- |
| `maria` | `Demo1234` |
| `john` | `Demo1234` |

The seed command is safe to run more than once. It does not change an existing account's password.

## Regenerate the web API client

Start the API first, then run:

```bash
pnpm --filter web api:generate
```
