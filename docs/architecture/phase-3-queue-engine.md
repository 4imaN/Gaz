# Phase 3: Queue Engine

## Scope

Phase 3 introduces durable queue entries, state history, idempotency records, and pump
assignments. PostgreSQL is authoritative; Redis snapshots are an optimization only.

## Database invariants

- A user or vehicle has at most one active queue entry.
- Queue order is derived from `joined_at`, then `id`; it is never persisted as a mutable
  position number.
- Every state transition creates a history record in the transaction that changed the entry.
- Mutating requests reserve an idempotency key by actor, route, and request hash.
- Pump slot capacity is checked inside the later assignment transaction; the initial schema
  stores assignments but does not pretend a static constraint can enforce dynamic capacity.

