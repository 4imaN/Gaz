CREATE TYPE queue_entry_status AS ENUM (
  'WAITING', 'PREPARE_TO_LEAVE', 'TRAVELLING', 'NEAR_STATION', 'CHECKED_IN', 'SKIPPED',
  'ASSIGNED_TO_PUMP', 'FUELING', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'STATION_CANCELLED'
);
CREATE TYPE pump_assignment_status AS ENUM ('RESERVED', 'ARRIVED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED');

CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
  fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  priority_score INTEGER NOT NULL DEFAULT 0,
  status queue_entry_status NOT NULL DEFAULT 'WAITING',
  estimated_service_at TIMESTAMPTZ,
  recommended_departure_at TIMESTAMPTZ,
  arrival_window_start TIMESTAMPTZ,
  arrival_window_end TIMESTAMPTZ,
  grace_period_end TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  qr_token_hash CHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX queue_entries_station_fuel_active_order_idx ON queue_entries(station_id, fuel_type_id, priority_score DESC, joined_at, id)
  WHERE status IN ('WAITING', 'PREPARE_TO_LEAVE', 'TRAVELLING', 'NEAR_STATION', 'CHECKED_IN', 'SKIPPED', 'ASSIGNED_TO_PUMP', 'FUELING');
CREATE UNIQUE INDEX queue_entries_one_active_user_idx ON queue_entries(user_id)
  WHERE status IN ('WAITING', 'PREPARE_TO_LEAVE', 'TRAVELLING', 'NEAR_STATION', 'CHECKED_IN', 'SKIPPED', 'ASSIGNED_TO_PUMP', 'FUELING');
CREATE UNIQUE INDEX queue_entries_one_active_vehicle_idx ON queue_entries(vehicle_id)
  WHERE status IN ('WAITING', 'PREPARE_TO_LEAVE', 'TRAVELLING', 'NEAR_STATION', 'CHECKED_IN', 'SKIPPED', 'ASSIGNED_TO_PUMP', 'FUELING');

CREATE TABLE queue_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id) ON DELETE CASCADE,
  from_status queue_entry_status,
  to_status queue_entry_status NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX queue_status_history_entry_created_idx ON queue_status_history(queue_entry_id, created_at);

CREATE TABLE pump_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id) ON DELETE RESTRICT,
  pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE RESTRICT,
  worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  service_started_at TIMESTAMPTZ,
  service_completed_at TIMESTAMPTZ,
  status pump_assignment_status NOT NULL DEFAULT 'RESERVED'
);
CREATE UNIQUE INDEX pump_assignments_one_active_entry_idx ON pump_assignments(queue_entry_id)
  WHERE status IN ('RESERVED', 'ARRIVED', 'IN_SERVICE');
CREATE INDEX pump_assignments_active_pump_idx ON pump_assignments(pump_id, assigned_at)
  WHERE status IN ('RESERVED', 'ARRIVED', 'IN_SERVICE');

CREATE TABLE idempotency_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route VARCHAR(160) NOT NULL,
  idempotency_key UUID NOT NULL,
  request_hash CHAR(64) NOT NULL,
  response_status INTEGER,
  response_body JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, route, idempotency_key)
);
CREATE INDEX idempotency_records_expires_at_idx ON idempotency_records(expires_at);
