CREATE TYPE station_approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE station_operating_status AS ENUM ('OPEN', 'CLOSED', 'PAUSED', 'EMERGENCY_CLOSED');
CREATE TYPE pump_status AS ENUM ('AVAILABLE', 'RESERVED', 'IN_USE', 'OFFLINE', 'MAINTENANCE', 'OUT_OF_FUEL', 'PAUSED');
CREATE TYPE inventory_status AS ENUM ('AVAILABLE', 'LOW', 'OUT_OF_STOCK', 'UNKNOWN');
CREATE TYPE inventory_transaction_type AS ENUM ('INITIAL_STOCK', 'REFILL', 'SALE', 'CORRECTION', 'LOSS');

CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name VARCHAR(160) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  entrance_latitude DECIMAL(9,6),
  entrance_longitude DECIMAL(9,6),
  approval_status station_approval_status NOT NULL DEFAULT 'PENDING',
  operating_status station_operating_status NOT NULL DEFAULT 'CLOSED',
  timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Addis_Ababa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX stations_owner_user_id_idx ON stations(owner_user_id);
CREATE INDEX stations_approval_operating_idx ON stations(approval_status, operating_status);

CREATE TABLE station_workers (
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (station_id, user_id)
);

CREATE TABLE fuel_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  display_name VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO fuel_types (code, display_name) VALUES ('PETROL', 'Petrol'), ('DIESEL', 'Diesel'), ('OTHER', 'Other');

CREATE TABLE pumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status pump_status NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (station_id, name)
);
CREATE INDEX pumps_station_id_idx ON pumps(station_id);

CREATE TABLE pump_fuel_types (
  pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE CASCADE,
  fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (pump_id, fuel_type_id)
);

CREATE TABLE fuel_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
  estimated_quantity_litres DECIMAL(14,3) NOT NULL DEFAULT 0 CHECK (estimated_quantity_litres >= 0),
  low_stock_threshold_litres DECIMAL(14,3) NOT NULL DEFAULT 0 CHECK (low_stock_threshold_litres >= 0),
  status inventory_status NOT NULL DEFAULT 'UNKNOWN',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (station_id, fuel_type_id)
);

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
  fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
  transaction_type inventory_transaction_type NOT NULL,
  quantity_litres DECIMAL(14,3) NOT NULL,
  reference_id UUID,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX inventory_transactions_station_fuel_created_idx ON inventory_transactions(station_id, fuel_type_id, created_at DESC);
