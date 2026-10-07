# Phase 0: Engineering Foundation

## Decisions

- The platform is a pnpm workspace orchestrated by Turborepo.
- The backend is one NestJS deployable with module boundaries that can later be extracted.
- PostgreSQL is permanent state and Redis supports coordination and background work.
- Runtime configuration is validated at process startup with Zod.
- HTTP API errors use a stable machine-readable envelope and include a request ID.
- Public HTTP contracts use `/api/v1`; API docs are exposed at `/api/docs` outside production.

## Local services

Docker Compose runs PostgreSQL 16 and Redis 7 with health checks and named volumes.
The API and worker have Dockerfiles so the complete local stack can be started together.

## Deferred work

Database migrations, authentication, domain modules, external providers, and application
feature screens are intentionally outside Phase 0.

