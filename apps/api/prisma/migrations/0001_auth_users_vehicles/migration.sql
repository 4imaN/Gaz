CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('ACTIVE', 'RESTRICTED', 'SUSPENDED', 'DELETED');
CREATE TYPE user_role AS ENUM ('DRIVER', 'WORKER', 'STATION_MANAGER', 'SUPPORT_AGENT', 'PLATFORM_ADMIN');
CREATE TYPE vehicle_type AS ENUM ('CAR', 'MOTORCYCLE', 'TAXI', 'MINIBUS', 'BUS', 'TRUCK', 'OTHER');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(16) NOT NULL UNIQUE,
  phone_verified_at TIMESTAMPTZ,
  preferred_language VARCHAR(8) NOT NULL DEFAULT 'en',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  plate_number VARCHAR(64) NOT NULL,
  plate_normalized VARCHAR(64) NOT NULL UNIQUE,
  vehicle_type vehicle_type NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  color VARCHAR(64),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX vehicles_user_id_idx ON vehicles(user_id);

CREATE TABLE auth_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX auth_otp_challenges_user_id_expires_at_idx ON auth_otp_challenges(user_id, expires_at);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX auth_sessions_user_id_expires_at_idx ON auth_sessions(user_id, expires_at);
