# ADR-001: Begin with a modular monolith

## Status

Accepted

## Context

The MVP has coupled operational workflows: queue state, pump assignment, service
completion, inventory, audit logs, and notifications. Splitting these workflows before
their boundaries are proven would add distributed transaction and deployment overhead.

## Decision

Deploy one NestJS application. Each domain is a Nest module with explicit public service
interfaces. Modules may not reach across persistence ownership directly. Internal events
are used for asynchronous follow-up work, and BullMQ handles retryable background jobs.

## Consequences

The first release has simpler deployment and transactional consistency. Module contracts
must remain explicit so selected domains can be extracted later without changing public APIs.

