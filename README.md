# Fuel Queue Platform

Monorepo for the Fuel Queue Platform MVP. It contains the NestJS API, BullMQ worker,
Next.js operational dashboards, Flutter mobile shells, shared TypeScript packages, and
local infrastructure.

## Prerequisites

- Node.js 20.19+
- pnpm 10+
- Docker Desktop (for PostgreSQL and Redis)
- Flutter SDK (for mobile applications)

## Local development

```bash
cp .env.example .env
pnpm install
docker compose -f infrastructure/local/docker-compose.yml up -d postgres redis
pnpm --filter @fuel-queue/api migration:deploy
pnpm --filter @fuel-queue/api dev
```

PostgreSQL is exposed on host port `5433` to avoid conflicting with a locally
installed PostgreSQL instance. Redis is exposed on `6379`.

API endpoints:

- `GET /health/live`
- `GET /health/ready`
- `GET /api/docs`

Run checks with `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

## Repository layout

- `apps/api`: NestJS modular-monolith API
- `apps/background-worker`: BullMQ background worker
- `apps/*-dashboard`: Next.js station and platform dashboards
- `apps/*-mobile`: separate Flutter driver and worker apps
- `packages`: shared contracts, validation, configuration, and future shared clients
- `infrastructure/local`: Docker Compose development dependencies
- `docs/architecture`: architecture decisions and phase design notes

## Phase status

The repository includes the engineering foundation plus initial backend slices for
authentication, users and vehicles, station setup, inventory, queues, worker
operations, routing contracts, and reporting helpers. It is not yet pilot-ready:
the remaining MVP work includes real-time delivery, production map and notification
providers, complete dashboard and mobile workflows, and the required integration,
concurrency, security, and load test coverage.
