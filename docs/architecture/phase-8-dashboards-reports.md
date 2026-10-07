# Phase 8: Dashboards and Reports

## Reporting boundary

Operational APIs write normalized transactions; reports read aggregates from those records.
Report generation runs asynchronously and never shares a request path with queue assignment or
worker service completion.

## Initial metrics

- vehicles served
- litres sold
- median and average wait time
- pump utilization
- cancellations and no-shows
- inventory movement by fuel type

