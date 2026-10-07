# Pilot Operations Runbook

## Before opening a station

1. Confirm the station is approved and its operating status is open.
2. Confirm active pumps and compatible fuel inventory.
3. Confirm workers can sign in and load their assigned station.
4. Test one QR scan and one licence-plate lookup.

## Incident response

1. Pause the affected pump or fuel-type queue.
2. Notify travelling drivers if station operations are affected.
3. Record the operational reason and preserve audit evidence.
4. Escalate database, Redis, or notification failures using the incident channel.

## Recovery verification

1. Restore a backup into an isolated environment.
2. Run migrations and verify queue, transaction, and inventory ledger counts.
3. Restart Redis and verify PostgreSQL remains the authoritative queue source.

