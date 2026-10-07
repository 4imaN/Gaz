# Phase 1: Authentication, Users, Vehicles, and Roles

## Scope

This phase provides development phone OTP authentication, short-lived JWT access tokens,
rotating refresh sessions, role authorization, and driver vehicle management.

## Security decisions

- OTP values are never persisted in plaintext. A hash of the phone number, OTP, and server
  secret is stored with a short expiry.
- Refresh tokens are random opaque values. Only their SHA-256 hashes are persisted, and each
  successful refresh revokes the previous session before creating a replacement.
- Development OTP responses expose the code only outside production. The configured code is
  `123456` by default and must never be used by a production provider.
- A bearer token is verified on every protected request. Role checks occur after identity
  authentication and before the controller action.
- Restricted, suspended, and deleted accounts cannot obtain or refresh sessions.

## Data model additions

`users`, `user_roles`, `vehicles`, `auth_otp_challenges`, and `auth_sessions` are introduced
by migration `0001_auth_users_vehicles`.
