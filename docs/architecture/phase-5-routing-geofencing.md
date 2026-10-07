# Phase 5: Maps, Routing, and Geofencing

## Provider boundary

The application depends on `RoutingProvider`, never a vendor SDK. A provider returns a route
estimate and may later support place search and reverse geocoding. Provider responses are
treated as short-lived estimates, not permanent location history.

## Privacy

Precise location is requested only for discovery, an active trip, or arrival confirmation.
The MVP retains no continuous historical track. Station proximity thresholds are configuration
values: 300 metres for near-station and 100 metres for arrival by default.

