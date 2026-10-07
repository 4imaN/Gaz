# Phase 6: Real-Time Updates and Notifications

## Event boundary

Domain services emit typed events after committed state changes. Delivery transports subscribe
to events; a delivery retry must not replay the business operation that emitted it.

## Privacy

Channels are scoped to a user, station, worker, manager, or administrator. Queue events sent
to drivers contain only the recipient's own queue data.

