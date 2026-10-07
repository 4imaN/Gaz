CREATE TABLE fuel_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id) ON DELETE RESTRICT,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
  pump_id UUID NOT NULL REFERENCES pumps(id) ON DELETE RESTRICT,
  worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  fuel_type_id UUID NOT NULL REFERENCES fuel_types(id) ON DELETE RESTRICT,
  quantity_litres DECIMAL(14,3) NOT NULL CHECK (quantity_litres > 0),
  unit_price DECIMAL(14,4),
  total_value DECIMAL(14,4),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (queue_entry_id)
);
CREATE INDEX fuel_transactions_station_completed_idx ON fuel_transactions(station_id, completed_at DESC);
CREATE INDEX fuel_transactions_pump_completed_idx ON fuel_transactions(pump_id, completed_at DESC);

ALTER TABLE inventory_transactions
  ADD CONSTRAINT inventory_transactions_quantity_nonzero CHECK (quantity_litres <> 0);
