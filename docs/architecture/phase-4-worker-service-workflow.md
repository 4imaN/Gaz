# Phase 4: Worker Service Workflow

## Scope

Workers verify a queued driver, assign a compatible pump, begin service, record litres,
and complete service. Completion writes the fuel sale and the corresponding inventory ledger
entry atomically.

## Completion invariant

A completed assignment may create exactly one fuel transaction. The transaction is linked to
the queue entry and assignment, and its inventory `SALE` entry reduces the estimated balance
in the same database transaction. Retried completion requests must return the existing result.

